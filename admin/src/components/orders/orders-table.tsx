"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {Input} from "@/components/ui/field";
import {OrderStatusBadge} from "@/components/orders/order-status-badge";
import {orderStatuses} from "@/lib/constants";
import {formatDate, formatMoney} from "@/lib/utils";
import {Order} from "@/types/order";

export function OrdersTable({orders}: {orders: Order[]}) {
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status === "ALL" || order.status === status;
      const matchesSearch = !term ||
        order.orderId.toLowerCase().includes(term) ||
        (order.telegramUsername ?? "").toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, status]);
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const visibleOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          placeholder="Search by order ID or Telegram username"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <select
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-3 text-sm"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          {orderStatuses.map((item) => (
            <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="bg-[var(--table-header)] text-left text-[var(--table-header-foreground)]">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">User</th>
              <th className="p-3">Product</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => (
              <tr key={order.orderId} className="border-t border-[var(--border)]">
                <td className="p-3 font-medium">{order.orderId}</td>
                <td className="p-3">{order.telegramUsername ? `@${order.telegramUsername}` : order.telegramUserId}</td>
                <td className="p-3">{order.productName}</td>
                <td className="p-3">{formatMoney(order.price)}</td>
                <td className="p-3"><OrderStatusBadge status={order.status} /></td>
                <td className="p-3">{formatDate(order.createdAt)}</td>
                <td className="p-3">
                  <Link className="text-sm font-semibold text-teal-700 dark:text-teal-300" href={`/admin/orders/${order.orderId}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!filteredOrders.length && (
              <tr>
                <td className="p-6 text-center text-[var(--muted)]" colSpan={7}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col justify-between gap-3 text-sm text-[var(--muted)] md:flex-row md:items-center">
        <p>
          Showing {filteredOrders.length ? (page - 1) * pageSize + 1 : 0}-
          {Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-[var(--border)] px-3 py-2 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            type="button"
          >
            Previous
          </button>
          <span>Page {page} of {pageCount}</span>
          <button
            className="rounded-md border border-[var(--border)] px-3 py-2 disabled:opacity-50"
            disabled={page >= pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
