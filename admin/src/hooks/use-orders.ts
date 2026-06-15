"use client";

import {collection, doc, onSnapshot, orderBy, query} from "firebase/firestore";
import {useEffect, useMemo, useState} from "react";
import {db} from "@/lib/firebase";
import {Order} from "@/types/order";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((item) => item.data() as Order));
        setError(null);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      },
    );
  }, []);

  return {orders, loading, error};
}

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    return onSnapshot(
      doc(db, "orders", orderId),
      (snap) => {
        setOrder(snap.exists() ? snap.data() as Order : null);
        setError(null);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      },
    );
  }, [orderId]);

  return {order, loading, error};
}

export function useDashboardStats(orders: Order[]) {
  return useMemo(() => {
    const today = new Date().toDateString();
    const isToday = (value: unknown) => {
      if (!value || typeof value !== "object" || !("toDate" in value)) {
        return false;
      }
      return (value as {toDate: () => Date}).toDate().toDateString() === today;
    };
    return {
      pendingApproval: orders.filter((order) => order.status === "WAITING_ADMIN_APPROVAL").length,
      approvedToday: orders.filter((order) => isToday(order.approvedAt)).length,
      rejectedToday: orders.filter((order) => isToday(order.rejectedAt)).length,
      completedToday: orders.filter((order) => ["COMPLETED", "AUTO_COMPLETED"].includes(order.status) && isToday(order.updatedAt)).length,
      failedOrders: orders.filter((order) => order.status === "FAILED").length,
      totalOrders: orders.length,
    };
  }, [orders]);
}
