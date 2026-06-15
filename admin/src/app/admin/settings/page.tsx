"use client";

import {Card} from "@/components/ui/card";
import {QrUpload} from "@/components/settings/qr-upload";
import {SettingsForm} from "@/components/settings/settings-form";
import {useSettings} from "@/hooks/use-settings";

export default function SettingsPage() {
  const {settings, loading, error} = useSettings();

  if (loading) return <p className="text-sm text-[var(--muted)]">Loading settings...</p>;
  if (error) return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;
  if (!settings) return <p className="text-sm text-[var(--muted)]">Settings not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-[var(--muted)]">Manage bot, OTP, admin contact, and payment QR settings.</p>
      </div>
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">DuitNow QR Image</h2>
        <QrUpload currentPath={settings.duitNowQrStoragePath} />
      </Card>
      <Card>
        <SettingsForm settings={settings} />
      </Card>
    </div>
  );
}
