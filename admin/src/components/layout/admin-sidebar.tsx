"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  LogOut,
  Package,
  ReceiptText,
  Settings,
  User,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {useAuth} from "@/hooks/use-auth";

const links = [
  {href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard},
  {href: "/admin/orders", label: "Orders", icon: ReceiptText},
  {href: "/admin/products", label: "Products", icon: Package},
  {href: "/admin/settings", label: "Settings", icon: Settings},
  {href: "/admin/logs", label: "Logs", icon: ListChecks},
  {href: "/admin/profile", label: "Profile", icon: User},
];

export function AdminSidebar() {
  const pathname = usePathname();
  const {logout} = useAuth();
  const confirmLogout = () => {
    if (window.confirm("Logout from Zhan Store Admin?")) {
      void logout();
    }
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 border-r border-[var(--border)] bg-[var(--panel)] p-4 md:block">
      <div className="mb-6 px-2">
        <p className="text-lg font-semibold">Zhan Store Admin</p>
        <p className="text-sm text-[var(--muted)]">Order operations</p>
      </div>
      <nav className="space-y-1">
        {links.map(({href, label, icon: Icon}) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium",
              pathname.startsWith(href)
                ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <button
          className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          onClick={confirmLogout}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
