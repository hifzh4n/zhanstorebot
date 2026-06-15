"use client";

import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {auth, db} from "@/lib/firebase";
import {logAdminEvent} from "@/lib/functions";

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setIsAdmin(false);
        setError(null);
        setLoading(false);
        return;
      }
      try {
        const adminSnap = await getDoc(doc(db, "adminUsers", nextUser.uid));
        const nextIsAdmin =
          nextUser.email === "hifzhan74@gmail.com" ||
          (adminSnap.exists() && adminSnap.get("isActive") === true);
        setIsAdmin(nextIsAdmin);
        if (nextIsAdmin && sessionStorage.getItem("adminLoginLogged") !== nextUser.uid) {
          sessionStorage.setItem("adminLoginLogged", nextUser.uid);
          logAdminEvent({action: "ADMIN_LOGIN"}).catch(() => undefined);
        }
        setError(null);
      } catch (nextError) {
        setIsAdmin(false);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to verify admin access.",
        );
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    if (auth.currentUser) {
      await logAdminEvent({action: "ADMIN_LOGOUT"}).catch(() => undefined);
    }
    sessionStorage.removeItem("adminLoginLogged");
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({user, isAdmin, loading, error, login, logout}),
    [user, isAdmin, loading, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
