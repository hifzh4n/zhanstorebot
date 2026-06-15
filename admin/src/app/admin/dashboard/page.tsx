"use client";

import Link from "next/link";
import {Card} from "@/components/ui/card";
import {OrdersTable} from "@/components/orders/orders-table";
import {useDashboardStats, useOrders} from "@/hooks/use-orders";
import {useSettings} from "@/hooks/use-settings";

export default function DashboardPage() {
  const {orders, loading, error: ordersError} = useOrders();
  const {settings, error: settingsError} = useSettings();
  const stats = useDashboardStats(orders);
  const recentOrders = orders.slice(0, 5);

  const cards = [
    ["Pending Approval", stats.pendingApproval],
    ["Approved Today", stats.approvedToday],
    ["Rejected Today", stats.rejectedToday],
    ["Completed Today", stats.completedToday],
    ["Failed Orders", stats.failedOrders],
    ["Total Orders", stats.totalOrders],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[var(--muted)]">Quick system summary and recent order activity.</p>
      </div>
      {(ordersError || settingsError) ? (
        <Card className="border-red-200 text-sm text-red-700 dark:border-red-900 dark:text-red-300">
          {ordersError || settingsError}
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link className="text-sm font-semibold text-[var(--primary)]" href="/admin/orders">View all</Link>
          </div>
          {loading ? <p className="text-sm text-[var(--muted)]">Loading orders...</p> : <OrdersTable orders={recentOrders} />}
        </Card>
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
            <div className="grid gap-2 text-sm font-medium">
              <Link className="rounded-md border border-[var(--border)] p-3 hover:bg-[var(--surface-hover)]" href="/admin/orders?status=WAITING_ADMIN_APPROVAL">View Pending Orders</Link>
              <Link className="rounded-md border border-[var(--border)] p-3 hover:bg-[var(--surface-hover)]" href="/admin/products">Manage Products</Link>
              <Link className="rounded-md border border-[var(--border)] p-3 hover:bg-[var(--surface-hover)]" href="/admin/settings">Update QR Code</Link>
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">System Status</h2>
            <div className="space-y-2 text-sm">
              <p>SMS Provider: <span className="font-medium">{settings?.smsProvider ?? "mock"}</span></p>
              <p>Bot Status: <span className="font-medium text-green-600">Active</span></p>
              <p>Maintenance Mode: <span className="font-medium">{settings?.isMaintenanceMode ? "On" : "Off"}</span></p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
