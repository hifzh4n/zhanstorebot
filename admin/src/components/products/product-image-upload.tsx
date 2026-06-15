"use client";

/* eslint-disable @next/next/no-img-element */

import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {storage} from "@/lib/firebase";
import {updateProduct} from "@/lib/functions";
import {Product} from "@/types/product";

export function ProductImageUpload({product}: {product: Product}) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(product.imageUrl ?? "");

  useEffect(() => {
    if (!product.imageStoragePath) {
      return;
    }
    let active = true;
    getDownloadURL(ref(storage, product.imageStoragePath))
      .then((url) => {
        if (active) setPreviewUrl(url);
      })
      .catch(() => {
        if (active) setPreviewUrl(product.imageUrl ?? "");
      });
    return () => {
      active = false;
    };
  }, [product.imageStoragePath, product.imageUrl]);

  const upload = async (file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Allowed image types are JPEG, PNG, and WEBP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be below 3 MB.");
      return;
    }
    setLoading(true);
    try {
      const extension = file.name.split(".").pop() ?? "png";
      const storagePath = `products/${product.id}.${extension}`;
      await uploadBytes(ref(storage, storagePath), file, {contentType: file.type});
      await updateProduct({productId: product.id, data: {imageStoragePath: storagePath}});
      toast.success("Product image updated successfully.");
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <img className="h-40 w-full rounded-md border border-[var(--border)] object-contain" src={previewUrl} alt={product.name} />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
          No product image uploaded.
        </div>
      )}
      <input
        className="text-sm"
        disabled={loading}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => upload(event.target.files?.[0] ?? null)}
      />
      {product.imageStoragePath && <p className="text-xs text-[var(--muted)]">{product.imageStoragePath}</p>}
      {loading && <p className="text-sm text-[var(--muted)]">Uploading...</p>}
      <Button className="hidden" type="button" />
    </div>
  );
}
