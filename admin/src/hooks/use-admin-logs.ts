"use client";

import {collection, limit, onSnapshot, orderBy, query} from "firebase/firestore";
import {useEffect, useState} from "react";
import {db} from "@/lib/firebase";
import {AdminLog} from "@/types/admin-log";

export function useAdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "adminLogs"), orderBy("createdAt", "desc"), limit(100));
    return onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map((item) => item.data() as AdminLog));
        setError(null);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      },
    );
  }, []);

  return {logs, loading, error};
}
