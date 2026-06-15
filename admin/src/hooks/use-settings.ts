"use client";

import {doc, onSnapshot} from "firebase/firestore";
import {useEffect, useState} from "react";
import {db} from "@/lib/firebase";
import {AppSettings} from "@/types/settings";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "app"),
      (snap) => {
        setSettings(snap.exists() ? snap.data() as AppSettings : null);
        setError(null);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      },
    );
  }, []);

  return {settings, loading, error};
}
