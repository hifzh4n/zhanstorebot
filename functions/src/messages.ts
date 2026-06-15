import {Product} from "./types/product";
import {Order} from "./types/order";
import {formatMoney} from "./utils/currency";
import {env} from "./config/env";

export const welcomeMessage = "Welcome to Zhan Store Bot\n\n" +
  "Choose your voucher below:";

export const productMessage = (product: Product): string => {
  return `${product.name}\n\n` +
    `Price: ${formatMoney(product.price)}\n\n` +
    "How it works:\n" +
    "1. Make payment using DuitNow QR.\n" +
    "2. Upload your payment proof.\n" +
    "3. Admin will verify your payment.\n" +
    "4. After approval, you will receive a Malaysia phone number.\n" +
    `5. Use the phone number in the ${product.brand} app.\n` +
    "6. Request OTP in the app.\n" +
    "7. Bot will send the OTP automatically once received.\n\n" +
    "Click below to proceed.";
};

export const tutorialIntroMessage = "Choose which voucher tutorial you want:";

export const tutorialMessage = (product: Product): string => {
  return `${product.name} Tutorial\n\n` +
    "1. Place an order in this bot and complete the DuitNow payment.\n" +
    "2. Upload your payment proof in the chat.\n" +
    "3. Wait for admin approval.\n" +
    "4. After approval, the bot will send you a Malaysia phone number.\n" +
    `5. Open the ${product.brand} app or website.\n` +
    "6. Choose login/register with phone number.\n" +
    "7. Enter the phone number from the bot.\n" +
    "8. Request OTP in the app or website.\n" +
    "9. Wait here. The bot will send the OTP automatically.\n" +
    "10. Use the OTP in the app before it expires.\n\n" +
    "If you are stuck, contact admin from the button below.";
};

export const paymentMessage = (order: Order): string => {
  return "Order Created\n\n" +
    `Order ID: ${order.orderId}\n` +
    `Product: ${order.productName}\n` +
    `Amount: ${formatMoney(order.price)}\n\n` +
    "Please scan the DuitNow QR and make payment.\n\n" +
    "After payment, upload your payment proof here as an image or PDF " +
    "document.";
};

export const activeOrderMessage = (order: Order): string => {
  return "You already have an active order.\n\n" +
    `Order ID: ${order.orderId}\n` +
    `Status: ${order.status}\n\n` +
    "Please complete or cancel this order first.";
};

export const ordersListMessage = (orders: Order[]): string => {
  if (!orders.length) {
    return "You do not have any orders yet.";
  }
  return "Your recent orders:\n\n" + orders.map((order) =>
    `${order.orderId}\n${order.productName}\n` +
    `Amount: ${formatMoney(order.price)}\nStatus: ${order.status}`,
  ).join("\n\n");
};

export const waitingApprovalMessage = "Your payment proof is still waiting " +
  "for admin approval.\n\nPlease wait for confirmation.\n" +
  `Need help? Contact admin: ${env.adminTelegramUsername}`;

export const proofReceivedMessage = "Payment proof received\n\n" +
  "Your order is now waiting for admin approval.\n" +
  "You will be notified once your payment has been reviewed.";

export const adminNotificationMessage = (order: Order): string => {
  const username = order.telegramUsername ?
    `@${order.telegramUsername}` :
    order.telegramUserId;
  return "New Payment Proof Received\n\n" +
    `Order ID: ${order.orderId}\n` +
    `Product: ${order.productName}\n` +
    `Amount: ${formatMoney(order.price)}\n` +
    `User: ${username}\n\n` +
    "Please review this order in the admin panel.";
};

export const approvedMessage = (order: Order): string => {
  return "Payment approved\n\n" +
    "Your phone number is ready:\n\n" +
    `${order.phoneNumber ?? ""}\n\n` +
    `Use this number to register in the ${order.brand} app.\n` +
    "After you request OTP in the app, wait here.\n" +
    "The bot will send the OTP automatically once it arrives.";
};

export const rejectedMessage = (reason: string): string => {
  return "Payment proof rejected\n\n" +
    `Reason:\n${reason}\n\n` +
    "Please upload a new payment proof or contact admin.\n" +
    `Admin: ${env.adminTelegramUsername}`;
};

export const otpReceivedMessage = (otpCode: string): string => {
  return "Your OTP is:\n\n" +
    `${otpCode}\n\n` +
    "Please use this code in the app.\n\n" +
    "This order will be automatically marked as completed after 10 minutes.\n" +
    "If everything is okay, you may click Complete now.";
};

export const helpMessage = "Need help?\n\nPlease contact admin directly:\n" +
  env.adminTelegramUsername;

export const errorMessage = "Sorry, something went wrong while processing " +
  `your order.\n\nPlease contact admin for help:\n${env.adminTelegramUsername}`;
