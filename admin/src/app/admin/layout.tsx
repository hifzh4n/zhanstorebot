"use client";

import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {AdminHeader} from "@/components/layout/admin-header";
import {AdminSidebar} from "@/components/layout/admin-sidebar";
import {useAuth} from "@/hooks/use-auth";

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const {user, isAdmin, loading, error, logout} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      logout().finally(() => router.replace("/login"));
    }
  }, [isAdmin, loading, logout, router, user]);

  if (loading || !user || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 text-sm text-[var(--muted)]">
          Loading admin session...
          {error ? (
            <p className="mt-3 max-w-md text-red-600 dark:text-red-300">
              {error}
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
