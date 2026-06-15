import {Bot} from "grammy";
import {env} from "../config/env";
import {adminPanelKeyboard} from "../keyboards";
import {Order} from "../types/order";
import {adminNotificationMessage} from "../messages";
import {getAppSettings} from "./settings.service";

export const notifyAdminPaymentProof = async (
  bot: Bot,
  order: Order,
): Promise<void> => {
  const settings = await getAppSettings();
  const adminChatId = settings.adminTelegramChatId || env.adminTelegramChatId;
  if (!adminChatId) {
    throw new Error("Admin Telegram Chat ID is not configured.");
  }
  if (!order.paymentProofUrl && !order.paymentProofStoragePath) {
    await bot.api.sendMessage(
      adminChatId,
      adminNotificationMessage(order),
      {reply_markup: adminPanelKeyboard(order.orderId)},
    );
    return;
  }
  await bot.api.sendMessage(
    adminChatId,
    adminNotificationMessage(order),
    {reply_markup: adminPanelKeyboard(order.orderId)},
  );
};
