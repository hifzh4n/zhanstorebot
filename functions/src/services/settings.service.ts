import {Timestamp} from "firebase-admin/firestore";
import {env} from "../config/env";
import {db} from "../firebase";

export interface AppSettings {
  isMaintenanceMode: boolean;
  mockPhoneNumber: string;
  mockOtp: string;
  otpCooldownSeconds: number;
  otpMaxAttempts: number;
  autoCompleteMinutes: number;
}

export const seedSettings = async (): Promise<void> => {
  const ref = db.collection("settings").doc("app");
  const snap = await ref.get();
  const now = Timestamp.now();
  if (snap.exists) {
    await ref.set(
      {
        adminTelegramUsername: env.adminTelegramUsername,
        adminTelegramChatId: env.adminTelegramChatId,
        duitNowQrStoragePath: env.duitNowQrStoragePath,
        smsProvider: env.smsProvider,
        mockPhoneNumber: env.mockPhoneNumber,
        mockOtp: env.mockOtp,
        otpCooldownSeconds: env.otpCooldownSeconds,
        otpMaxAttempts: env.otpMaxAttempts,
        autoCompleteMinutes: env.autoCompleteMinutes,
        updatedAt: now,
      },
      {merge: true},
    );
    return;
  }
  await ref.set({
    botName: "Zhan Store Bot",
    currency: "MYR",
    adminTelegramUsername: env.adminTelegramUsername,
    adminTelegramChatId: env.adminTelegramChatId,
    duitNowQrUrl: "",
    duitNowQrStoragePath: env.duitNowQrStoragePath,
    smsProvider: env.smsProvider,
    mockPhoneNumber: env.mockPhoneNumber,
    mockOtp: env.mockOtp,
    otpCooldownSeconds: env.otpCooldownSeconds,
    otpMaxAttempts: env.otpMaxAttempts,
    autoCompleteMinutes: env.autoCompleteMinutes,
    isMaintenanceMode: false,
    createdAt: now,
    updatedAt: now,
  });
};

export const getAppSettings = async (): Promise<AppSettings> => {
  await seedSettings();
  const snap = await db.collection("settings").doc("app").get();
  return {
    isMaintenanceMode: Boolean(snap.get("isMaintenanceMode")),
    mockPhoneNumber: String(snap.get("mockPhoneNumber") ?? env.mockPhoneNumber),
    mockOtp: String(snap.get("mockOtp") ?? env.mockOtp),
    otpCooldownSeconds: Number(
      snap.get("otpCooldownSeconds") ?? env.otpCooldownSeconds,
    ),
    otpMaxAttempts: Number(snap.get("otpMaxAttempts") ?? env.otpMaxAttempts),
    autoCompleteMinutes: Number(
      snap.get("autoCompleteMinutes") ?? env.autoCompleteMinutes,
    ),
  };
};
