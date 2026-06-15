"use client";

import {useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {approvePayment} from "@/lib/functions";

export function ApprovePaymentButton({orderId}: {orderId: string}) {
  const [loading, setLoading] = useState(false);

  const approve = async () => {
    setLoading(true);
    try {
      await approvePayment({orderId});
      toast.success("Payment approved successfully.");
    } catch {
      toast.error("Failed to approve payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading} onClick={approve}>
      {loading ? "Approving..." : "Approve Payment"}
    </Button>
  );
}
