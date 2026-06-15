"use client";

import {Card} from "@/components/ui/card";
import {OrdersTable} from "@/components/orders/orders-table";
import {useOrders} from "@/hooks/use-orders";

export default function OrdersPage() {
  const {orders, loading, error} = useOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-[var(--muted)]">Search, filter, and review all voucher orders.</p>
      </div>
      <Card>
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading orders...</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        ) : (
          <OrdersTable orders={orders} />
        )}
      </Card>
    </div>
  );
}
