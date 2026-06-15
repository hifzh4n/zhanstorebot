"use client";

import {useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input, Label, Textarea} from "@/components/ui/field";
import {updateProduct} from "@/lib/functions";
import {Product} from "@/types/product";

export function ProductForm({product}: {product: Product}) {
  const [form, setForm] = useState(product);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!form.name || !form.serviceName || form.price <= 0) {
      toast.error("Please fill all required product fields.");
      return;
    }
    setLoading(true);
    try {
      await updateProduct({
        productId: product.id,
        data: {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          serviceName: form.serviceName,
          isActive: form.isActive,
          imageStoragePath: form.imageStoragePath ?? "",
        },
      });
      toast.success("Product updated successfully.");
    } catch {
      toast.error("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Product name</Label>
          <Input value={form.name} onChange={(event) => setForm({...form, name: event.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Service name</Label>
          <Input value={form.serviceName} onChange={(event) => setForm({...form, serviceName: event.target.value})} />
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Price</Label>
          <Input type="number" step="0.01" value={form.price} onChange={(event) => setForm({...form, price: Number(event.target.value)})} />
        </div>
        <label className="flex items-center gap-2 pt-7 text-sm font-medium">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({...form, isActive: event.target.checked})} />
          Active product
        </label>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(event) => setForm({...form, description: event.target.value})} />
      </div>
      <Button disabled={loading} onClick={save}>{loading ? "Saving..." : "Save Product"}</Button>
    </div>
  );
}
