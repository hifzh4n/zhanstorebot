"use client";

import {CalendarClock, Fingerprint, LogOut, Mail, ShieldCheck, UserRound} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {useAuth} from "@/hooks/use-auth";

export default function ProfilePage() {
  const {user, logout, isAdmin} = useAuth();
  const confirmLogout = () => {
    if (window.confirm("Logout from Zhan Store Admin?")) {
      void logout();
    }
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-[var(--muted)]">Manage your admin session and account details.</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="bg-[var(--panel-muted)] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                <UserRound className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{displayName}</h2>
                <p className="text-sm text-[var(--muted)]">{user?.email ?? "-"}</p>
              </div>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
              {isAdmin ? "Active administrator" : "Access pending"}
            </div>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          <InfoTile icon={Mail} label="Email" value={user?.email ?? "-"} />
          <InfoTile icon={Fingerprint} label="User ID" value={user?.uid ?? "-"} />
          <InfoTile icon={CalendarClock} label="Created" value={user?.metadata.creationTime ?? "-"} />
          <InfoTile icon={CalendarClock} label="Last login" value={user?.metadata.lastSignInTime ?? "-"} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="text-lg font-semibold">Admin Access</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            This account is authorized through Firebase Authentication and the admin user record used by Cloud Functions.
            Product changes, payment approvals, rejections, and settings updates are checked again on the server.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Session</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">End this browser session when you finish managing orders.</p>
          <Button className="mt-4 w-full" variant="secondary" onClick={confirmLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-[var(--border)] p-5 md:odd:border-r">
      <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted)]">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="break-all text-sm font-medium">{value}</p>
    </div>
  );
}
