import {Timestamp} from "firebase-admin/firestore";
import {Bot, Context, InputFile, webhookCallback} from "grammy";
import {env} from "./config/env";
import {
  activeOrderKeyboard,
  completeKeyboard,
  paymentKeyboard,
  productDetailKeyboard,
  productsKeyboard,
  tutorialsKeyboard,
} from "./keyboards";
import {
  activeOrderMessage,
  errorMessage,
  helpMessage,
  otpReceivedMessage,
  ordersListMessage,
  paymentMessage,
  productMessage,
  proofReceivedMessage,
  tutorialIntroMessage,
  tutorialMessage,
  waitingApprovalMessage,
  welcomeMessage,
} from "./messages";
import {
  addOrderLog,
  createOrder,
  getActiveOrder,
  getLatestProofableOrder,
  getOrder,
  listRecentOrdersForUser,
  updateOrder,
} from "./services/order.service";
import {getProduct, listActiveProducts} from "./services/product.service";
import {upsertUser} from "./services/user.service";
import {MockSmsService} from "./services/mock-sms.service";
import {SmsProvider} from "./services/sms-provider.interface";
import {SmsCodeService} from "./services/smscode.service";
import {notifyAdminPaymentProof} from "./services/admin-notification.service";
import {recordPaymentProof} from "./services/payment-proof.service";
import {readStorageFile, savePaymentProof} from "./services/storage.service";
import {getAppSettings} from "./services/settings.service";
import {
  extensionForMimeType,
  isAllowedPaymentProof,
  maxPaymentProofBytes,
} from "./utils/file-validation";
import {formatMoney} from "./utils/currency";
import {db} from "./firebase";

const botToken = env.telegramBotToken || "0000000000:missing-token";

export const bot = new Bot(botToken);
const smsProvider: SmsProvider = env.smsProvider === "smscode" ?
  new SmsCodeService() :
  new MockSmsService();

bot.use(async (_ctx, next) => {
  if (!env.telegramBotToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
  }
  await next();
});

bot.use(async (ctx, next) => {
  const updateId = ctx.update.update_id;
  const ref = db.collection("telegramUpdates").doc(String(updateId));
  try {
    await ref.create({
      updateId,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    const code = (error as {code?: number | string}).code;
    if (code === 6 || code === "already-exists") {
      return;
    }
    throw error;
  }
  await next();
});

const showProducts = async (ctx: Context): Promise<void> => {
  const products = await listActiveProducts();
  await ctx.reply(welcomeMessage, {
    reply_markup: productsKeyboard(products),
  });
};

const showTutorials = async (ctx: Context): Promise<void> => {
  const products = await listActiveProducts();
  await ctx.reply(tutorialIntroMessage, {
    reply_markup: tutorialsKeyboard(products),
  });
};

const requireUser = (ctx: Context): NonNullable<Context["from"]> => {
  if (!ctx.from) {
    throw new Error("Telegram user is missing from context");
  }
  return ctx.from;
};

const ensureAvailable = async (ctx: Context): Promise<boolean> => {
  const settings = await getAppSettings();
  if (!settings.isMaintenanceMode) {
    return true;
  }
  await ctx.reply("Sorry, this product is temporarily unavailable.\n\n" +
    `Please contact admin:\n${env.adminTelegramUsername}`);
  return false;
};

bot.command("start", async (ctx) => {
  const user = requireUser(ctx);
  await upsertUser(user);
  const activeOrder = await getActiveOrder(String(user.id));
  if (activeOrder) {
    await ctx.reply(activeOrderMessage(activeOrder), {
      reply_markup: activeOrderKeyboard(activeOrder),
    });
    return;
  }
  await showProducts(ctx);
});

bot.command("products", async (ctx) => {
  const user = requireUser(ctx);
  await upsertUser(user);
  await showProducts(ctx);
});

bot.command("orders", async (ctx) => {
  const user = requireUser(ctx);
  await upsertUser(user);
  const orders = await listRecentOrdersForUser(String(user.id));
  await ctx.reply(ordersListMessage(orders));
});

bot.command("tutorial", async (ctx) => {
  const user = requireUser(ctx);
  await upsertUser(user);
  await showTutorials(ctx);
});

bot.command("admin_subscribe", async (ctx) => {
  const user = requireUser(ctx);
  const settings = await getAppSettings();
  const allowedUsername = settings.adminTelegramUsername
    .replace("@", "")
    .toLowerCase();
  const username = (user.username ?? "").toLowerCase();
  if (!allowedUsername || username !== allowedUsername) {
    await ctx.reply("Only the configured admin account can subscribe this chat.");
    return;
  }
  if (!ctx.chat) {
    await ctx.reply(errorMessage);
    return;
  }
  await db.collection("settings").doc("app").set(
    {
      adminTelegramChatId: String(ctx.chat.id),
      adminTelegramUsername: settings.adminTelegramUsername,
      updatedAt: Timestamp.now(),
    },
    {merge: true},
  );
  await ctx.reply("Admin notifications are now connected to this chat.");
});

bot.command("help", async (ctx) => {
  await ctx.reply(helpMessage);
});

bot.callbackQuery("nav:products", async (ctx) => {
  await ctx.answerCallbackQuery();
  await showProducts(ctx);
});

bot.callbackQuery("nav:tutorials", async (ctx) => {
  await ctx.answerCallbackQuery();
  await showTutorials(ctx);
});

bot.callbackQuery(/^tutorial:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const product = await getProduct(ctx.match[1]);
  if (!product || !product.isActive) {
    await ctx.reply("Sorry, this tutorial is temporarily unavailable.");
    return;
  }
  await ctx.reply(tutorialMessage(product), {
    reply_markup: productDetailKeyboard(product.id),
  });
});

bot.callbackQuery(/^product:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const productId = ctx.match[1];
  if (!(await ensureAvailable(ctx))) {
    return;
  }
  const product = await getProduct(productId);
  if (!product || !product.isActive) {
    await ctx.reply("Sorry, this product is temporarily unavailable.\n\n" +
      `Please contact admin:\n${env.adminTelegramUsername}`);
    return;
  }
  await ctx.reply(productMessage(product), {
    reply_markup: productDetailKeyboard(product.id),
  });
});

bot.callbackQuery(/^payment:proceed:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const user = requireUser(ctx);
  if (!ctx.chat) {
    await ctx.reply(errorMessage);
    return;
  }
  if (!(await ensureAvailable(ctx))) {
    return;
  }
  const product = await getProduct(ctx.match[1]);
  if (!product || !product.isActive) {
    await ctx.reply("Sorry, this product is temporarily unavailable.\n\n" +
      `Please contact admin:\n${env.adminTelegramUsername}`);
    return;
  }
  const activeOrder = await getActiveOrder(String(user.id));
  if (activeOrder) {
    await ctx.reply(activeOrderMessage(activeOrder), {
      reply_markup: activeOrderKeyboard(activeOrder),
    });
    return;
  }
  const order = await createOrder({
    telegramUserId: String(user.id),
    telegramUsername: user.username ?? null,
    telegramChatId: String(ctx.chat.id),
    product,
  });
  await sendPaymentInstructions(ctx, order.orderId);
});

bot.callbackQuery(/^order:view:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendOrderStatus(ctx, ctx.match[1]);
});

bot.callbackQuery(/^order:upload-proof:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const order = await getOrder(ctx.match[1]);
  if (!order) {
    await ctx.reply("Order not found.");
    return;
  }
  if (!["WAITING_PROOF", "PAYMENT_REJECTED"].includes(order.status)) {
    await ctx.reply("This order is not waiting for a new payment proof.");
    return;
  }
  await updateOrder(order.orderId, {status: "WAITING_PROOF"});
  await addOrderLog(order.orderId, "WAITING_PROOF",
    "New payment proof requested");
  await ctx.reply("Please upload your new payment proof as an image or PDF " +
    "document.");
});

bot.callbackQuery(/^order:cancel:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const order = await getOrder(ctx.match[1]);
  if (!order) {
    await ctx.reply("Order not found.");
    return;
  }
  if (!["WAITING_PAYMENT", "WAITING_PROOF", "PAYMENT_REJECTED"]
    .includes(order.status)) {
    await ctx.reply("This order cannot be cancelled at this stage.\n\n" +
      `Please contact admin:\n${env.adminTelegramUsername}`);
    return;
  }
  await updateOrder(order.orderId, {
    status: "CANCELLED",
    cancelledAt: Timestamp.now(),
  });
  await addOrderLog(order.orderId, "ORDER_CANCELLED", "Order cancelled");
  await ctx.reply("Your order has been cancelled.");
});

bot.callbackQuery(/^otp:check:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  await checkOtp(ctx, ctx.match[1]);
});

bot.callbackQuery(/^order:complete:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const order = await getOrder(ctx.match[1]);
  if (!order) {
    await ctx.reply("Order not found.");
    return;
  }
  if (["COMPLETED", "AUTO_COMPLETED"].includes(order.status)) {
    await ctx.reply("This order is already completed.");
    return;
  }
  if (order.status !== "OTP_RECEIVED") {
    await ctx.reply("This order is not ready to complete yet.");
    return;
  }
  await updateOrder(order.orderId, {
    status: "COMPLETED",
    completedAt: Timestamp.now(),
  });
  await addOrderLog(order.orderId, "ORDER_COMPLETED", "Order completed");
  await ctx.reply("Thank you\n\nYour order has been completed.");
});

bot.callbackQuery(/^order:help:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const orderId = ctx.match[1];
  await updateOrder(orderId, {errorMessage: null});
  await addOrderLog(orderId, "SUPPORT_REQUESTED", "User requested support");
  await ctx.reply(helpMessage);
});

bot.on(["message:photo", "message:document"], async (ctx) => {
  const user = requireUser(ctx);
  const activeOrder = await getLatestProofableOrder(String(user.id));
  if (!activeOrder) {
    await ctx.reply("Please create an order before uploading payment proof.");
    return;
  }
  if (!["WAITING_PROOF", "PAYMENT_REJECTED"].includes(activeOrder.status)) {
    await ctx.reply(waitingApprovalMessage);
    return;
  }
  await handlePaymentProof(ctx, activeOrder.orderId);
});

bot.on("message", async (ctx) => {
  const user = requireUser(ctx);
  const activeOrder = await getActiveOrder(String(user.id));
  if (activeOrder?.status === "WAITING_ADMIN_APPROVAL") {
    await ctx.reply(waitingApprovalMessage);
    return;
  }
  await ctx.reply("Please choose an option from the bot menu.");
});

const sendPaymentInstructions = async (
  ctx: Context,
  orderId: string,
): Promise<void> => {
  const order = await getOrder(orderId);
  if (!order) {
    await ctx.reply(errorMessage);
    return;
  }
  if (order.status === "WAITING_PAYMENT") {
    await updateOrder(orderId, {status: "WAITING_PROOF"});
    await addOrderLog(orderId, "WAITING_PROOF", "Payment proof requested");
  }
  const settingsSnap = await db.collection("settings").doc("app").get();
  const qrUrl = settingsSnap.exists ?
    settingsSnap.get("duitNowQrUrl") as string | undefined :
    undefined;
  const qrStoragePath = settingsSnap.exists ?
    settingsSnap.get("duitNowQrStoragePath") as string | undefined :
    undefined;
  if (qrUrl) {
    await ctx.replyWithPhoto(qrUrl, {
      caption: paymentMessage(order),
      reply_markup: paymentKeyboard(order.orderId),
    });
    return;
  }
  if (qrStoragePath) {
    const qr = await readStorageFile(qrStoragePath);
    await ctx.replyWithPhoto(new InputFile(qr.buffer, qr.fileName), {
      caption: paymentMessage(order),
      reply_markup: paymentKeyboard(order.orderId),
    });
    return;
  }
  await ctx.reply(paymentMessage(order) + "\n\n" +
    "DuitNow QR is not configured yet. Please contact admin if needed.", {
    reply_markup: paymentKeyboard(order.orderId),
  });
};

const handlePaymentProof = async (
  ctx: Context,
  orderId: string,
): Promise<void> => {
  const fileInfo = await extractFileInfo(ctx);
  if (!fileInfo) {
    await ctx.reply("Invalid file type.\n\n" +
      "Please upload payment proof as an image or PDF document.");
    return;
  }
  if (!isAllowedPaymentProof(fileInfo.mimeType)) {
    await ctx.reply("Invalid file type.\n\n" +
      "Please upload payment proof as an image or PDF document.");
    return;
  }
  if (fileInfo.size > maxPaymentProofBytes) {
    await ctx.reply("File is too large.\n\nPlease upload a file below 5 MB.");
    return;
  }
  const file = await bot.api.getFile(fileInfo.fileId);
  const fileUrl = `https://api.telegram.org/file/bot${env.telegramBotToken}/` +
    file.file_path;
  const response = await fetch(fileUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = extensionForMimeType(fileInfo.mimeType);
  const storagePath = `payment-proofs/${orderId}/proof.${extension}`;
  const signedUrl = await savePaymentProof({
    buffer,
    contentType: fileInfo.mimeType,
    storagePath,
  });
  const order = await getOrder(orderId);
  if (!order) {
    await ctx.reply(errorMessage);
    return;
  }
  await updateOrder(orderId, {
    status: "WAITING_ADMIN_APPROVAL",
    paymentProofUrl: signedUrl,
    paymentProofStoragePath: storagePath,
    paymentProofFileType: fileInfo.mimeType,
    paymentUploadedAt: Timestamp.now(),
    rejectionReason: null,
    rejectedAt: null,
    rejectedBy: null,
  });
  await recordPaymentProof({
    orderId,
    telegramUserId: order.telegramUserId,
    fileUrl: signedUrl,
    storagePath,
    fileType: fileInfo.mimeType,
    fileName: fileInfo.fileName,
    fileSize: fileInfo.size,
  });
  await addOrderLog(orderId, "PAYMENT_PROOF_UPLOADED",
    "User uploaded payment proof", {fileType: fileInfo.mimeType});
  const updatedOrder = await getOrder(orderId);
  if (updatedOrder) {
    try {
      await notifyAdminPaymentProof(bot, updatedOrder);
      await addOrderLog(orderId, "ADMIN_NOTIFIED", "Admin notified");
    } catch (error) {
      await addOrderLog(orderId, "ADMIN_NOTIFY_FAILED",
        "Failed to notify admin", {
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }
  await ctx.reply(proofReceivedMessage);
};

const extractFileInfo = async (ctx: Context): Promise<{
  fileId: string;
  mimeType: string;
  fileName: string;
  size: number;
} | null> => {
  const document = ctx.message?.document;
  if (document) {
    return {
      fileId: document.file_id,
      mimeType: document.mime_type ?? "application/octet-stream",
      fileName: document.file_name ?? "proof",
      size: document.file_size ?? 0,
    };
  }
  const photos = ctx.message?.photo;
  if (!photos?.length) {
    return null;
  }
  const photo = photos[photos.length - 1];
  return {
    fileId: photo.file_id,
    mimeType: "image/jpeg",
    fileName: "proof.jpg",
    size: photo.file_size ?? 0,
  };
};

const checkOtp = async (ctx: Context, orderId: string): Promise<void> => {
  const order = await getOrder(orderId);
  const settings = await getAppSettings();
  if (!order) {
    await ctx.reply("Order not found.");
    return;
  }
  if (order.status === "OTP_RECEIVED") {
    await ctx.reply(otpReceivedMessage(order.otpCode ?? ""), {
      reply_markup: completeKeyboard(orderId),
    });
    return;
  }
  if (order.status !== "WAITING_OTP") {
    await ctx.reply("OTP cannot be checked for this order status.");
    return;
  }
  if (order.otpAttempts >= settings.otpMaxAttempts) {
    await updateOrder(orderId, {status: "OTP_ATTEMPT_LIMIT_REACHED"});
    await ctx.reply("You have reached the maximum OTP check attempts.\n\n" +
      `Please contact admin for help: ${env.adminTelegramUsername}`);
    return;
  }
  if (order.lastOtpCheckAt) {
    const seconds = (Date.now() -
      order.lastOtpCheckAt.toMillis()) / 1000;
    if (seconds < settings.otpCooldownSeconds) {
      await ctx.reply(`Please wait ${settings.otpCooldownSeconds} seconds ` +
        "before checking OTP again.");
      return;
    }
  }
  await updateOrder(orderId, {
    otpAttempts: order.otpAttempts + 1,
    lastOtpCheckAt: Timestamp.now(),
  });
  await addOrderLog(orderId, "OTP_CHECKED", "User checked OTP");
  const result = await smsProvider.getOtp({
    smsOrderId: order.smsOrderId ?? order.orderId,
    orderId,
  });
  if (!result.success) {
    await ctx.reply(result.errorMessage ?? errorMessage);
    return;
  }
  if (!result.isReady || !result.otpCode) {
    await ctx.reply("OTP is not received yet.\n\nPlease wait and try again.");
    return;
  }
  const autoCompleteAt = Timestamp.fromMillis(
    Date.now() + settings.autoCompleteMinutes * 60 * 1000,
  );
  await updateOrder(orderId, {
    status: "OTP_RECEIVED",
    otpCode: result.otpCode,
    otpReceivedAt: Timestamp.now(),
    autoCompleteAt,
  });
  await addOrderLog(orderId, "OTP_RECEIVED", "OTP received");
  await ctx.reply(otpReceivedMessage(result.otpCode), {
    reply_markup: completeKeyboard(orderId),
  });
};

const sendOrderStatus = async (
  ctx: Context,
  orderId: string,
): Promise<void> => {
  const order = await getOrder(orderId);
  if (!order) {
    await ctx.reply("Order not found.");
    return;
  }
  await ctx.reply(
    `Order ID: ${order.orderId}\n` +
    `Product: ${order.productName}\n` +
    `Amount: ${formatMoney(order.price)}\n` +
    `Status: ${order.status}`,
  );
};

export const telegramWebhook = webhookCallback(bot, "express", {
  secretToken: env.telegramWebhookSecret || undefined,
});
