"use client";

import Link from "next/link";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {OrderStatusBadge} from "@/components/orders/order-status-badge";
import {useProducts} from "@/hooks/use-products";
import {formatMoney} from "@/lib/utils";

export default function ProductsPage() {
  const {products, loading, error} = useProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-[var(--muted)]">Manage voucher products and images.</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>
      <Card className="overflow-hidden p-0">
        {loading ? (
          <p className="p-5 text-sm text-[var(--muted)]">Loading products...</p>
        ) : error ? (
          <p className="p-5 text-sm text-red-600 dark:text-red-300">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="bg-[var(--panel-muted)] text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Brand</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-[var(--border)] hover:bg-[var(--surface-hover)]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="max-w-md truncate text-xs text-[var(--muted)]">
                        {product.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{product.serviceName}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{product.brand}</td>
                    <td className="px-4 py-3 font-medium">{formatMoney(product.price)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={product.isActive ? "ACTIVE" : "CANCELLED"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        className="font-semibold text-[var(--primary)]"
                        href={`/admin/products/${product.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {!products.length ? (
                  <tr>
                    <td className="p-6 text-center text-[var(--muted)]" colSpan={6}>No products found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
