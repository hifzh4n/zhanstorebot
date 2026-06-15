export interface AppSettings {
  botName: string;
  currency: string;
  adminTelegramUsername: string;
  adminTelegramChatId: string;
  duitNowQrUrl: string;
  duitNowQrStoragePath: string;
  smsProvider: string;
  mockPhoneNumber: string;
  mockOtp: string;
  otpCooldownSeconds: number;
  otpMaxAttempts: number;
  autoCompleteMinutes: number;
  isMaintenanceMode: boolean;
}
