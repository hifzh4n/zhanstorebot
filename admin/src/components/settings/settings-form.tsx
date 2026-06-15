"use client";

import {useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input, Label} from "@/components/ui/field";
import {updateSettings} from "@/lib/functions";
import {AppSettings} from "@/types/settings";

export function SettingsForm({settings}: {settings: AppSettings}) {
  const [form, setForm] = useState(settings);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!form.botName || !form.adminTelegramUsername || form.otpCooldownSeconds <= 0 || form.otpMaxAttempts <= 0 || form.autoCompleteMinutes <= 0) {
      toast.error("Please check required settings values.");
      return;
    }
    setLoading(true);
    try {
      await updateSettings({data: form as unknown as Record<string, unknown>});
      toast.success("Settings saved successfully.");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Section title="Bot Settings">
        <Field label="Bot Name" value={form.botName} onChange={(value) => setForm({...form, botName: value})} />
        <Field label="Currency" value={form.currency} onChange={(value) => setForm({...form, currency: value})} />
        <Field label="SMS Provider" value={form.smsProvider} onChange={(value) => setForm({...form, smsProvider: value})} />
      </Section>
      <Section title="OTP Settings">
        <Field label="OTP Cooldown Seconds" type="number" value={form.otpCooldownSeconds} onChange={(value) => setForm({...form, otpCooldownSeconds: Number(value)})} />
        <Field label="OTP Max Attempts" type="number" value={form.otpMaxAttempts} onChange={(value) => setForm({...form, otpMaxAttempts: Number(value)})} />
        <Field label="Auto Complete Minutes" type="number" value={form.autoCompleteMinutes} onChange={(value) => setForm({...form, autoCompleteMinutes: Number(value)})} />
        <Field label="Mock Phone Number" value={form.mockPhoneNumber} onChange={(value) => setForm({...form, mockPhoneNumber: value})} />
        <Field label="Mock OTP" value={form.mockOtp} onChange={(value) => setForm({...form, mockOtp: value})} />
      </Section>
      <Section title="Admin Contact">
        <Field label="Admin Telegram Username" value={form.adminTelegramUsername} onChange={(value) => setForm({...form, adminTelegramUsername: value})} />
        <Field label="Admin Telegram Chat ID" value={form.adminTelegramChatId} onChange={(value) => setForm({...form, adminTelegramChatId: value})} />
      </Section>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.isMaintenanceMode}
          onChange={(event) => setForm({...form, isMaintenanceMode: event.target.checked})}
        />
        Maintenance mode
      </label>
      <Button disabled={loading} onClick={save}>{loading ? "Saving..." : "Save Settings"}</Button>
    </div>
  );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      <h3 className="md:col-span-2 font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function Field({label, value, onChange, type = "text"}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
