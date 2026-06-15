import {Timestamp} from "firebase-admin/firestore";
import {UserFromGetMe} from "grammy/types";
import {db} from "../firebase";

interface TelegramUserLike {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
}

export const upsertUser = async (
  user: TelegramUserLike | UserFromGetMe,
): Promise<void> => {
  const now = Timestamp.now();
  const ref = db.collection("users").doc(String(user.id));
  const snap = await ref.get();
  await ref.set(
    {
      telegramUserId: String(user.id),
      username: "username" in user ? user.username ?? null : null,
      firstName: "first_name" in user ? user.first_name ?? null : null,
      lastName: "last_name" in user ? user.last_name ?? null : null,
      languageCode: "language_code" in user ? user.language_code ?? null : null,
      createdAt: snap.exists ? snap.get("createdAt") : now,
      updatedAt: now,
      lastActiveAt: now,
    },
    {merge: true},
  );
};
