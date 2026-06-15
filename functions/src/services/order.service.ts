import {Timestamp} from "firebase-admin/firestore";
import {db} from "../firebase";
import {ACTIVE_ORDER_STATUSES} from "../constants/statuses";
import {Order} from "../types/order";
import {Product} from "../types/product";
import {env} from "../config/env";
import {createOrderId} from "../utils/order-id";

const orders = db.collection("orders");

export const getOrder = async (orderId: string): Promise<Order | null> => {
  const snap = await orders.doc(orderId).get();
  return snap.exists ? snap.data() as Order : null;
};

export const getActiveOrder = async (
  telegramUserId: string,
): Promise<Order | null> => {
  const snap = await orders
    .where("telegramUserId", "==", telegramUserId)
    .limit(25)
    .get();
  const activeStatuses = new Set<string>(ACTIVE_ORDER_STATUSES);
  const activeOrders = snap.docs
    .map((doc) => doc.data() as Order)
    .filter((order) => activeStatuses.has(order.status))
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  return activeOrders[0] ?? null;
};

export const getLatestProofableOrder = async (
  telegramUserId: string,
): Promise<Order | null> => {
  const snap = await orders
    .where("telegramUserId", "==", telegramUserId)
    .limit(25)
    .get();
  const proofableStatuses = new Set(["WAITING_PROOF", "PAYMENT_REJECTED"]);
  const proofableOrders = snap.docs
    .map((doc) => doc.data() as Order)
    .filter((order) => proofableStatuses.has(order.status))
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  return proofableOrders[0] ?? null;
};

export const listRecentOrdersForUser = async (
  telegramUserId: string,
): Promise<Order[]> => {
  const snap = await orders
    .where("telegramUserId", "==", telegramUserId)
    .limit(25)
    .get();
  return snap.docs
    .map((doc) => doc.data() as Order)
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, 5);
};

export const createOrder = async (params: {
  telegramUserId: string;
  telegramUsername: string | null;
  telegramChatId: string;
  product: Product;
}): Promise<Order> => {
  const now = Timestamp.now();
  let orderId = createOrderId();
  let ref = orders.doc(orderId);
  while ((await ref.get()).exists) {
    orderId = createOrderId();
    ref = orders.doc(orderId);
  }
  const order: Order = {
    orderId,
    telegramUserId: params.telegramUserId,
    telegramUsername: params.telegramUsername,
    telegramChatId: params.telegramChatId,
    productId: params.product.id,
    productName: params.product.name,
    brand: params.product.brand,
    serviceName: params.product.serviceName,
    smsCodeCatalogProductId: params.product.smsCodeCatalogProductId ?? null,
    price: params.product.price,
    currency: params.product.currency,
    status: "WAITING_PAYMENT",
    paymentMethod: "DUITNOW_QR",
    paymentProofUrl: null,
    paymentProofStoragePath: null,
    paymentProofFileType: null,
    paymentUploadedAt: null,
    rejectionReason: null,
    rejectedAt: null,
    rejectedBy: null,
    approvedAt: null,
    approvedBy: null,
    smsProvider: env.smsProvider,
    smsOrderId: null,
    phoneNumber: null,
    otpCode: null,
    otpAttempts: 0,
    lastOtpCheckAt: null,
    otpReceivedAt: null,
    autoCompleteAt: null,
    completedAt: null,
    cancelledAt: null,
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(order);
  await addOrderLog(orderId, "ORDER_CREATED", "Order created");
  return order;
};

export const updateOrder = async (
  orderId: string,
  data: Partial<Order>,
): Promise<void> => {
  await orders.doc(orderId).set(
    {
      ...data,
      updatedAt: Timestamp.now(),
    },
    {merge: true},
  );
};

export const addOrderLog = async (
  orderId: string,
  action: string,
  message: string,
  metadata: Record<string, unknown> = {},
): Promise<void> => {
  await orders.doc(orderId).collection("logs").add({
    action,
    message,
    metadata,
    createdAt: Timestamp.now(),
  });
};

export const listAutoCompletableOrders = async (): Promise<Order[]> => {
  const snap = await orders
    .where("status", "==", "OTP_RECEIVED")
    .where("autoCompleteAt", "<=", Timestamp.now())
    .limit(50)
    .get();
  return snap.docs.map((doc) => doc.data() as Order);
};

export const listWaitingOtpOrders = async (): Promise<Order[]> => {
  const snap = await orders
    .where("status", "==", "WAITING_OTP")
    .limit(50)
    .get();
  return snap.docs.map((doc) => doc.data() as Order);
};
