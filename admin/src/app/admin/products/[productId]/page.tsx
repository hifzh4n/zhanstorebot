"use client";

import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {ArrowLeft, Trash2} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {OrderStatusBadge} from "@/components/orders/order-status-badge";
import {ProductForm} from "@/components/products/product-form";
import {ProductImageUpload} from "@/components/products/product-image-upload";
import {useProducts} from "@/hooks/use-products";
import {deleteProduct} from "@/lib/functions";
import {formatMoney} from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams<{productId: string}>();
  const router = useRouter();
  const {products, loading, error} = useProducts();
  const product = products.find((item) => item.id === params.productId);

  const remove = async () => {
    if (!product) return;
    if (!window.confirm(`Delete ${product.name}? This will remove it from the bot product list.`)) {
      return;
    }
    try {
      await deleteProduct({productId: product.id});
      toast.success("Product deleted.");
      router.replace("/admin/products");
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading product...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>Product not found.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <Link
            className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
            href="/admin/products"
          >
            <ArrowLeft className="h-4 w-4" />
            Products
          </Link>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-sm text-[var(--muted)]">
            {product.brand} · {product.serviceName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={product.isActive ? "ACTIVE" : "CANCELLED"} />
          <Button variant="danger" onClick={remove}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Edit Product</h2>
          <ProductForm product={product} />
        </Card>
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Product Image</h2>
            <ProductImageUpload product={product} />
          </Card>
          <Card className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold">Summary</h2>
            <Row label="Product ID" value={product.id} />
            <Row label="Price" value={formatMoney(product.price)} />
            <Row label="SMSCode catalog ID" value={product.smsCodeCatalogProductId ? String(product.smsCodeCatalogProductId) : "-"} />
            <Row label="SMSCode max price" value={product.smsCodeMaxPrice ? String(product.smsCodeMaxPrice) : "-"} />
            <Row label="Storage path" value={product.imageStoragePath ?? "-"} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({label, value}: {label: string; value: string}) {
  return (
    <div className="grid gap-1">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="break-all font-medium">{value}</span>
    </div>
  );
}
