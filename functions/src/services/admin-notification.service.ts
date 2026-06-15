import {Bot} from "grammy";
import {env} from "../config/env";
import {adminPanelKeyboard} from "../keyboards";
import {Order} from "../types/order";
import {adminNotificationMessage} from "../messages";

export const notifyAdminPaymentProof = async (
  bot: Bot,
  order: Order,
): Promise<void> => {
  if (!env.adminTelegramChatId) {
    return;
  }
  await bot.api.sendMessage(
    env.adminTelegramChatId,
    adminNotificationMessage(order),
    {reply_markup: adminPanelKeyboard(order.orderId)},
  );
};
