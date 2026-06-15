"use client";

import {httpsCallable} from "firebase/functions";
import {functions} from "@/lib/firebase";

export const approvePayment = httpsCallable<{orderId: string}, {ok: boolean}>(
  functions,
  "approvePayment",
);

export const rejectPayment = httpsCallable<
  {orderId: string; reason: string},
  {ok: boolean}
>(functions, "rejectPayment");

export const updateProduct = httpsCallable<
  {productId: string; data: Record<string, unknown>},
  {ok: boolean}
>(functions, "updateProduct");

export const createProduct = httpsCallable<
  {data: Record<string, unknown>},
  {ok: boolean; productId: string}
>(functions, "createProduct");

export const deleteProduct = httpsCallable<{productId: string}, {ok: boolean}>(
  functions,
  "deleteProduct",
);

export const updateSettings = httpsCallable<
  {data: Record<string, unknown>},
  {ok: boolean}
>(functions, "updateSettings");

export const logAdminEvent = httpsCallable<
  {action: "ADMIN_LOGIN" | "ADMIN_LOGOUT"},
  {ok: boolean}
>(functions, "logAdminEvent");
