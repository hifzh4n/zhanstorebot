import {InlineKeyboard} from "grammy";
import {Product} from "./types/product";
import {Order} from "./types/order";
import {env} from "./config/env";

export const productsKeyboard = (products: Product[]): InlineKeyboard => {
  const keyboard = new InlineKeyboard();
  products.forEach((product) => {
    keyboard.text(product.name, `product:${product.id}`).row();
  });
  keyboard.url("Contact Admin", `https://t.me/${env.adminTelegramUsername
    .replace("@", "")}`);
  return keyboard;
};

export const productDetailKeyboard = (productId: string): InlineKeyboard => {
  return new InlineKeyboard()
    .text("Proceed to Payment", `payment:proceed:${productId}`)
    .row()
    .text("Back to Products", "nav:products")
    .row()
    .url("Contact Admin", `https://t.me/${env.adminTelegramUsername
      .replace("@", "")}`);
};

export const paymentKeyboard = (orderId: string): InlineKeyboard => {
  return new InlineKeyboard()
    .text("Cancel Order", `order:cancel:${orderId}`)
    .row()
    .url("Contact Admin", `https://t.me/${env.adminTelegramUsername
      .replace("@", "")}`);
};

export const activeOrderKeyboard = (order: Order): InlineKeyboard => {
  return new InlineKeyboard()
    .text("View Order", `order:view:${order.orderId}`)
    .row()
    .text("Cancel Order", `order:cancel:${order.orderId}`)
    .row()
    .url("Contact Admin", `https://t.me/${env.adminTelegramUsername
      .replace("@", "")}`);
};

export const otpKeyboard = (orderId: string): InlineKeyboard => {
  return new InlineKeyboard()
    .text("Check OTP", `otp:check:${orderId}`)
    .row()
    .text("Need Help", `order:help:${orderId}`);
};

export const completeKeyboard = (orderId: string): InlineKeyboard => {
  return new InlineKeyboard()
    .text("Complete", `order:complete:${orderId}`)
    .row()
    .text("Need Help", `order:help:${orderId}`);
};

export const rejectedKeyboard = (orderId: string): InlineKeyboard => {
  return new InlineKeyboard()
    .text("Upload New Proof", `order:upload-proof:${orderId}`)
    .row()
    .url("Contact Admin", `https://t.me/${env.adminTelegramUsername
      .replace("@", "")}`)
    .row()
    .text("Cancel Order", `order:cancel:${orderId}`);
};

export const adminPanelKeyboard = (orderId: string): InlineKeyboard => {
  return new InlineKeyboard().url(
    "Open Admin Panel",
    `${env.adminPanelUrl}/admin/orders/${orderId}`,
  );
};
