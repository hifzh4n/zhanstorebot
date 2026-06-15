"use client";

import {useParams} from "next/navigation";
import {ApprovePaymentButton} from "@/components/orders/approve-payment-button";
import {OrderStatusBadge} from "@/components/orders/order-status-badge";
import {PaymentProofPreview} from "@/components/orders/payment-proof-preview";
import {RejectPaymentDialog} from "@/components/orders/reject-payment-dialog";
import {Card} from "@/components/ui/card";
import {useOrderLogs} from "@/hooks/use-order-logs";
import {useOrder} from "@/hooks/use-orders";
import {formatDate, formatMoney} from "@/lib/utils";

export default function OrderDetailsPage() {
  const params = useParams<{orderId: string}>();
  const {order, loading} = useOrder(params.orderId);
  const {logs, loading: logsLoading} = useOrderLogs(params.orderId);

  if (loading) return <p className="text-sm text-[var(--muted)]">Loading order...</p>;
  if (!order) return <p className="text-sm text-[var(--muted)]">Order not found.</p>;

  const canReview = order.status === "WAITING_ADMIN_APPROVAL";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{order.orderId}</h1>
        <p className="text-sm text-[var(--muted)]">Review payment proof and order status.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <dl className="grid gap-3 text-sm">
            <Row label="Product" value={order.productName} />
            <Row label="Brand" value={order.brand} />
            <Row label="Amount" value={formatMoney(order.price)} />
            <div className="flex justify-between gap-4"><dt>Status</dt><dd><OrderStatusBadge status={order.status} /></dd></div>
            <Row label="Created" value={formatDate(order.createdAt)} />
            <Row label="Updated" value={formatDate(order.updatedAt)} />
          </dl>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Customer Info</h2>
          <dl className="grid gap-3 text-sm">
            <Row label="Telegram User ID" value={order.telegramUserId} />
            <Row label="Username" value={order.telegramUsername ? `@${order.telegramUsername}` : "-"} />
            <Row label="Chat ID" value={order.telegramChatId} />
          </dl>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Payment Proof</h2>
          <PaymentProofPreview order={order} />
        </section>
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 text-lg font-semibold">OTP / Phone Info</h2>
            <dl className="grid gap-3 text-sm">
              <Row label="SMS Provider" value={order.smsProvider} />
              <Row label="SMS Order ID" value={order.smsOrderId ?? "-"} />
              <Row label="Phone Number" value={order.phoneNumber ?? "-"} />
              <Row label="OTP Code" value={order.otpCode ?? "-"} />
              <Row label="OTP Attempts" value={String(order.otpAttempts ?? 0)} />
              <Row label="Last OTP Check" value={formatDate(order.lastOtpCheckAt)} />
              <Row label="Auto Complete At" value={formatDate(order.autoCompleteAt)} />
            </dl>
          </Card>
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Admin Actions</h2>
            {canReview ? (
              <div className="space-y-3">
                <ApprovePaymentButton orderId={order.orderId} />
                <RejectPaymentDialog orderId={order.orderId} />
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">No actions available for this status.</p>
            )}
          </Card>
        </div>
      </div>
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Status Timeline</h2>
        {logsLoading ? (
          <p className="text-sm text-[var(--muted)]">Loading timeline...</p>
        ) : logs.length ? (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div key={`${log.action}-${index}`} className="grid gap-1 border-l-2 border-[var(--border)] pl-4">
                <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                  <p className="font-medium">{log.action.replaceAll("_", " ")}</p>
                  <p className="text-xs text-[var(--muted)]">{formatDate(log.createdAt)}</p>
                </div>
                <p className="text-sm text-[var(--muted)]">{log.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No timeline entries yet.</p>
        )}
      </Card>
    </div>
  );
}

function Row({label, value}: {label: string; value: string}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
