"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowLeft} from "lucide-react";
import {useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Input, Label, Textarea} from "@/components/ui/field";
import {createProduct} from "@/lib/functions";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    brand: "",
    serviceName: "",
    price: 2.5,
    description: "",
    isActive: true,
  });

  const save = async () => {
    if (!form.id || !form.name || !form.brand || !form.serviceName || form.price <= 0) {
      toast.error("Please fill product ID, name, brand, service name, and price.");
      return;
    }
    setLoading(true);
    try {
      const result = await createProduct({data: form});
      toast.success("Product created.");
      router.replace(`/admin/products/${result.data.productId}`);
    } catch {
      toast.error("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]" href="/admin/products">
          <ArrowLeft className="h-4 w-4" />
          Products
        </Link>
        <h1 className="text-2xl font-semibold">New Product</h1>
        <p className="text-sm text-[var(--muted)]">Create a voucher product for the Telegram bot.</p>
      </div>
      <Card className="max-w-3xl space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Product ID" value={form.id} onChange={(value) => setForm({...form, id: value})} />
          <Field label="Product name" value={form.name} onChange={(value) => setForm({...form, name: value})} />
          <Field label="Brand" value={form.brand} onChange={(value) => setForm({...form, brand: value})} />
          <Field label="Service name" value={form.serviceName} onChange={(value) => setForm({...form, serviceName: value})} />
          <Field label="Price" type="number" value={form.price} onChange={(value) => setForm({...form, price: Number(value)})} />
          <label className="flex items-center gap-2 pt-7 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({...form, isActive: event.target.checked})}
            />
            Active product
          </label>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(event) => setForm({...form, description: event.target.value})} />
        </div>
        <Button disabled={loading} onClick={save}>{loading ? "Creating..." : "Create Product"}</Button>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
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
