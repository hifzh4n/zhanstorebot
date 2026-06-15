"use client";

import {collection, onSnapshot, orderBy, query} from "firebase/firestore";
import {useEffect, useState} from "react";
import {db} from "@/lib/firebase";
import {OrderLog} from "@/types/order-log";

export function useOrderLogs(orderId: string) {
  const [logs, setLogs] = useState<OrderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const q = query(collection(db, "orders", orderId, "logs"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map((item) => item.data() as OrderLog));
        setError(null);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      },
    );
  }, [orderId]);

  return {logs, loading, error};
}
