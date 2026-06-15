"use client";

import {useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/field";
import {rejectPayment} from "@/lib/functions";

export function RejectPaymentDialog({orderId}: {orderId: string}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (reason.trim().length < 5) {
      toast.error("Reject reason must be at least 5 characters.");
      return;
    }
    setLoading(true);
    try {
      await rejectPayment({orderId, reason: reason.trim()});
      toast.success("Payment rejected successfully.");
      setOpen(false);
    } catch {
      toast.error("Failed to reject payment.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return <Button variant="danger" onClick={() => setOpen(true)}>Reject Payment</Button>;
  }

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] p-4">
      <p className="font-medium">Reject payment</p>
      <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" />
      <div className="flex gap-2">
        <Button disabled={loading} variant="danger" onClick={submit}>
          {loading ? "Rejecting..." : "Reject Order"}
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}
