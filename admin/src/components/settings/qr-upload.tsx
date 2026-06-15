"use client";

/* eslint-disable @next/next/no-img-element */

import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {storage} from "@/lib/firebase";
import {updateSettings} from "@/lib/functions";

export function QrUpload({currentPath}: {currentPath?: string}) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!currentPath) {
      return;
    }
    let active = true;
    getDownloadURL(ref(storage, currentPath))
      .then((url) => {
        if (active) setPreviewUrl(url);
      })
      .catch(() => {
        if (active) setPreviewUrl("");
      });
    return () => {
      active = false;
    };
  }, [currentPath]);

  const upload = async (file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Allowed image types are JPEG, PNG, and WEBP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("QR image must be below 3 MB.");
      return;
    }
    setLoading(true);
    try {
      const extension = file.name.split(".").pop() ?? "png";
      const storagePath = `qr/duitnow-qr.${extension}`;
      await uploadBytes(ref(storage, storagePath), file, {contentType: file.type});
      await updateSettings({data: {duitNowQrStoragePath: storagePath, duitNowQrUrl: ""}});
      toast.success("QR image updated successfully.");
    } catch {
      toast.error("Failed to upload QR image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <img className="max-h-72 w-full rounded-md border border-[var(--border)] object-contain" src={previewUrl} alt="DuitNow QR" />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
          No QR preview available.
        </div>
      )}
      <input
        className="text-sm"
        disabled={loading}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => upload(event.target.files?.[0] ?? null)}
      />
      <p className="text-xs text-[var(--muted)]">Current path: {currentPath ?? "-"}</p>
      {loading && <p className="text-sm text-[var(--muted)]">Uploading...</p>}
    </div>
  );
}
