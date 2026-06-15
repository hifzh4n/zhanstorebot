import {setGlobalOptions} from "firebase-functions";
import {HttpsError, onCall, onRequest} from "firebase-functions/https";
import {onSchedule} from "firebase-functions/scheduler";
import * as logger from "firebase-functions/logger";
import {Timestamp} from "firebase-admin/firestore";
import {telegramWebhook, bot} from "./bot";
import {db} from "./firebase";
import {otpKeyboard, rejectedKeyboard} from "./keyboards";
import {approvedMessage, rejectedMessage} from "./messages";
import {MockSmsService} from "./services/mock-sms.service";
import {
  addOrderLog,
  getOrder,
  listAutoCompletableOrders,
  updateOrder,
} from "./services/order.service";
import {seedProducts} from "./services/product.service";
import {seedSettings} from "./services/settings.service";

setGlobalOptions({maxInstances: 10, region: "asia-southeast1"});

const verifyAdmin = async (auth: {
  uid: string;
  token: {email?: string};
} | null | undefined) => {
  if (!auth) {
    throw new HttpsError("unauthenticated", "Login is required.");
  }
  const snap = await db.collection("adminUsers").doc(auth.uid).get();
  if (!snap.exists || snap.get("isActive") !== true) {
    throw new HttpsError("permission-denied", "Admin access is required.");
  }
  return {
    uid: auth.uid,
    email: auth.token.email ?? snap.get("email") ?? "",
  };
};

const createAdminLog = async (params: {
  action: string;
  adminId: string;
  adminEmail: string;
  message: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}) => {
  const ref = db.collection("adminLogs").doc();
  await ref.set({
    logId: ref.id,
    ...params,
    createdAt: Timestamp.now(),
  });
};

export const telegramBot = onRequest(async (request, response) => {
  await telegramWebhook(request, response);
});

export const seedDefaultProducts = onRequest(async (_request, response) => {
  await seedProducts();
  await seedSettings();
  response.json({ok: true});
});

export const setupTelegramBot = onRequest(async (_request, response) => {
  await bot.api.setMyCommands([
    {command: "start", description: "Start the bot"},
    {command: "products", description: "View voucher products"},
    {command: "tutorial", description: "View voucher tutorials"},
    {command: "orders", description: "View current order status"},
    {command: "help", description: "Contact admin"},
  ]);
  response.json({ok: true});
});

export const approvePayment = onCall(async (request) => {
  const admin = await verifyAdmin(request.auth);
  const orderId = String(request.data?.orderId ?? "");
  if (!orderId) {
    throw new HttpsError("invalid-argument", "orderId is required.");
  }
  const order = await getOrder(orderId);
  if (!order) {
    throw new HttpsError("not-found", "Order not found.");
  }
  if (order.status !== "WAITING_ADMIN_APPROVAL") {
    throw new HttpsError("failed-precondition", "Order status already changed.");
  }

  await updateOrder(orderId, {
    status: "REQUESTING_NUMBER",
    approvedAt: Timestamp.now(),
    approvedBy: admin.uid,
  });
  await addOrderLog(orderId, "PAYMENT_APPROVED", "Payment approved");
  await createAdminLog({
    action: "PAYMENT_APPROVED",
    adminId: admin.uid,
    adminEmail: admin.email,
    orderId,
    message: "Payment approved",
  });

  const smsProvider = new MockSmsService();
  const result = await smsProvider.requestNumber({
    serviceName: order.serviceName,
    country: "malaysia",
    orderId,
  });
  if (!result.success || !result.phoneNumber) {
    await updateOrder(orderId, {
      status: "FAILED",
      errorMessage: result.errorMessage ?? "Phone number request failed",
    });
    throw new HttpsError("internal", "Phone number request failed.");
  }
  await updateOrder(orderId, {
    status: "WAITING_OTP",
    smsOrderId: result.smsOrderId ?? null,
    phoneNumber: result.phoneNumber,
  });
  await addOrderLog(orderId, "PHONE_NUMBER_RECEIVED",
    "Mock phone number received");
  const updated = await getOrder(orderId);
  if (updated) {
    await bot.api.sendMessage(updated.telegramChatId, approvedMessage(updated), {
      reply_markup: otpKeyboard(orderId),
    });
  }
  return {ok: true};
});

export const rejectPayment = onCall(async (request) => {
  const admin = await verifyAdmin(request.auth);
  const orderId = String(request.data?.orderId ?? "");
  const reason = String(request.data?.reason ?? "").trim();
  if (!orderId) {
    throw new HttpsError("invalid-argument", "orderId is required.");
  }
  if (reason.length < 5) {
    throw new HttpsError("invalid-argument", "Reject reason is required.");
  }
  const order = await getOrder(orderId);
  if (!order) {
    throw new HttpsError("not-found", "Order not found.");
  }
  if (order.status !== "WAITING_ADMIN_APPROVAL") {
    throw new HttpsError("failed-precondition", "Order status already changed.");
  }
  await updateOrder(orderId, {
    status: "PAYMENT_REJECTED",
    rejectionReason: reason,
    rejectedAt: Timestamp.now(),
    rejectedBy: admin.uid,
  });
  await addOrderLog(orderId, "PAYMENT_REJECTED", "Payment rejected", {reason});
  await createAdminLog({
    action: "PAYMENT_REJECTED",
    adminId: admin.uid,
    adminEmail: admin.email,
    orderId,
    message: "Payment rejected",
    metadata: {reason},
  });
  await bot.api.sendMessage(order.telegramChatId, rejectedMessage(reason), {
    reply_markup: rejectedKeyboard(orderId),
  });
  return {ok: true};
});

export const updateProduct = onCall(async (request) => {
  const admin = await verifyAdmin(request.auth);
  const productId = String(request.data?.productId ?? "");
  const data = request.data?.data as Record<string, unknown> | undefined;
  if (!productId || !data) {
    throw new HttpsError("invalid-argument", "productId and data are required.");
  }
  const allowed: Record<string, unknown> = {};
  for (const key of [
    "name",
    "description",
    "price",
    "serviceName",
    "isActive",
    "imageStoragePath",
  ]) {
    if (key in data) allowed[key] = data[key];
  }
  if ("name" in allowed && !String(allowed.name).trim()) {
    throw new HttpsError("invalid-argument", "Product name is required.");
  }
  if ("serviceName" in allowed && !String(allowed.serviceName).trim()) {
    throw new HttpsError("invalid-argument", "Service name is required.");
  }
  if ("price" in allowed && Number(allowed.price) <= 0) {
    throw new HttpsError("invalid-argument", "Price must be more than 0.");
  }
  await db.collection("products").doc(productId).set(
    {...allowed, updatedAt: Timestamp.now()},
    {merge: true},
  );
  await createAdminLog({
    action: "PRODUCT_UPDATED",
    adminId: admin.uid,
    adminEmail: admin.email,
    message: "Product updated",
    metadata: {productId},
  });
  return {ok: true};
});

export const createProduct = onCall(async (request) => {
  const admin = await verifyAdmin(request.auth);
  const data = request.data?.data as Record<string, unknown> | undefined;
  if (!data) {
    throw new HttpsError("invalid-argument", "data is required.");
  }
  const name = String(data.name ?? "").trim();
  const brand = String(data.brand ?? "").trim();
  const serviceName = String(data.serviceName ?? "").trim();
  const price = Number(data.price);
  const description = String(data.description ?? "").trim();
  const id = String(data.id ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!id || !name || !brand || !serviceName || price <= 0) {
    throw new HttpsError("invalid-argument",
      "Product ID, name, brand, service name, and price are required.");
  }
  const ref = db.collection("products").doc(id);
  if ((await ref.get()).exists) {
    throw new HttpsError("already-exists", "Product ID already exists.");
  }
  await ref.set({
    id,
    name,
    brand,
    serviceName,
    price,
    currency: "MYR",
    description,
    imageUrl: "",
    imageStoragePath: "",
    isActive: Boolean(data.isActive ?? true),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  await createAdminLog({
    action: "PRODUCT_CREATED",
    adminId: admin.uid,
    adminEmail: admin.email,
    message: "Product created",
    metadata: {productId: id},
  });
  return {ok: true, productId: id};
});

export const deleteProduct = onCall(async (request) => {
  const admin = await verifyAdmin(request.auth);
  const productId = String(request.data?.productId ?? "");
  if (!productId) {
    throw new HttpsError("invalid-argument", "productId is required.");
  }
  const productRef = db.collection("products").doc(productId);
  const product = await productRef.get();
  if (!product.exists) {
    throw new HttpsError("not-found", "Product not found.");
  }
  await productRef.set(
    {
      isActive: false,
      deletedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {merge: true},
  );
  await createAdminLog({
    action: "PRODUCT_DELETED",
    adminId: admin.uid,
    adminEmail: admin.email,
    message: "Product deleted",
    metadata: {productId},
  });
  return {ok: true};
});

export const updateSettings = onCall(async (request) => {
  const admin = await verifyAdmin(request.auth);
  const data = request.data?.data as Record<string, unknown> | undefined;
  if (!data) {
    throw new HttpsError("invalid-argument", "data is required.");
  }
  const allowed: Record<string, unknown> = {};
  for (const key of [
    "botName",
    "currency",
    "adminTelegramUsername",
    "adminTelegramChatId",
    "duitNowQrUrl",
    "duitNowQrStoragePath",
    "smsProvider",
    "mockPhoneNumber",
    "mockOtp",
    "otpCooldownSeconds",
    "otpMaxAttempts",
    "autoCompleteMinutes",
    "isMaintenanceMode",
  ]) {
    if (key in data) allowed[key] = data[key];
  }
  if ("botName" in allowed && !String(allowed.botName).trim()) {
    throw new HttpsError("invalid-argument", "Bot name is required.");
  }
  if ("adminTelegramUsername" in allowed &&
    !String(allowed.adminTelegramUsername).trim()) {
    throw new HttpsError("invalid-argument",
      "Admin Telegram username is required.");
  }
  for (const key of [
    "otpCooldownSeconds",
    "otpMaxAttempts",
    "autoCompleteMinutes",
  ]) {
    if (key in allowed && Number(allowed[key]) <= 0) {
      throw new HttpsError("invalid-argument", `${key} must be more than 0.`);
    }
  }
  await db.collection("settings").doc("app").set(
    {...allowed, updatedAt: Timestamp.now()},
    {merge: true},
  );
  await createAdminLog({
    action: "SETTINGS_UPDATED",
    adminId: admin.uid,
    adminEmail: admin.email,
    message: "Settings updated",
  });
  return {ok: true};
});

export const logAdminEvent = onCall(async (request) => {
  const admin = await verifyAdmin(request.auth);
  const action = String(request.data?.action ?? "").trim();
  if (!["ADMIN_LOGIN", "ADMIN_LOGOUT"].includes(action)) {
    throw new HttpsError("invalid-argument", "Unsupported admin event.");
  }
  await createAdminLog({
    action,
    adminId: admin.uid,
    adminEmail: admin.email,
    message: action === "ADMIN_LOGIN" ? "Admin logged in" : "Admin logged out",
  });
  return {ok: true};
});

export const autoCompleteOrders = onSchedule(
  "every 1 minutes",
  async () => {
    const orders = await listAutoCompletableOrders();
    await Promise.all(orders.map(async (order) => {
      await updateOrder(order.orderId, {
        status: "AUTO_COMPLETED",
        completedAt: Timestamp.now(),
      });
      await addOrderLog(
        order.orderId,
        "ORDER_AUTO_COMPLETED",
        "Order auto-completed after OTP window",
      );
      try {
        await bot.api.sendMessage(
          order.telegramChatId,
          "Thank you\n\nYour order has been automatically completed.",
        );
      } catch (error) {
        logger.warn("Failed to notify auto-complete", {
          orderId: order.orderId,
          error,
        });
      }
    }));
  },
);
