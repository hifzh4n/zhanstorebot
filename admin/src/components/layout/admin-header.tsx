"use client";

import {LogOut} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ThemeToggle} from "@/components/layout/theme-toggle";
import {useAuth} from "@/hooks/use-auth";

export function AdminHeader() {
  const {user, logout} = useAuth();
  const confirmLogout = () => {
    if (window.confirm("Logout from Zhan Store Admin?")) {
      void logout();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--panel)]/95 px-4 backdrop-blur md:px-6">
      <div>
        <p className="text-sm text-[var(--muted)]">Admin Panel</p>
        <p className="font-medium">{user?.email ?? "Admin"}</p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="secondary" onClick={confirmLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
