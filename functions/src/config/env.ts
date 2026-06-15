const readNumber = (key: string, fallback: number): number => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) ? value : fallback;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

export const env = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET ?? "",
  appProjectId: process.env.APP_PROJECT_ID ?? "",
  appStorageBucket: process.env.APP_STORAGE_BUCKET ?? "",
  duitNowQrStoragePath: process.env.DUITNOW_QR_STORAGE_PATH ?? "images/qr.JPG",
  adminTelegramUsername:
    process.env.ADMIN_TELEGRAM_USERNAME ?? "@tauhusoya",
  adminTelegramChatId: process.env.ADMIN_TELEGRAM_CHAT_ID ?? "",
  adminPanelUrl: trimTrailingSlash(
    process.env.ADMIN_PANEL_URL ?? "https://your-domain.com",
  ),
  smsProvider: process.env.SMS_PROVIDER ?? "mock",
  smscodeApiToken: process.env.SMSCODE_API_TOKEN ?? "",
  smscodeBaseUrl: trimTrailingSlash(
    process.env.SMSCODE_BASE_URL ?? "https://api.smscode.gg/v1",
  ),
  mockPhoneNumber: process.env.MOCK_PHONE_NUMBER ?? "+60123456789",
  mockOtp: process.env.MOCK_OTP ?? "123456",
  otpCooldownSeconds: readNumber("OTP_COOLDOWN_SECONDS", 15),
  otpMaxAttempts: readNumber("OTP_MAX_ATTEMPTS", 10),
  autoCompleteMinutes: readNumber("AUTO_COMPLETE_MINUTES", 10),
};
