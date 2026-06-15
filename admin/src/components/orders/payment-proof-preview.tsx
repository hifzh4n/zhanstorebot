"use client";

import {FileText} from "lucide-react";
import {useEffect, useState} from "react";
import {getDownloadURL, ref} from "firebase/storage";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {storage} from "@/lib/firebase";
import {Order} from "@/types/order";

export function PaymentProofPreview({order}: {order: Order}) {
  const [url, setUrl] = useState<string | null>(order.paymentProofUrl);

  useEffect(() => {
    if (order.paymentProofStoragePath) {
      getDownloadURL(ref(storage, order.paymentProofStoragePath))
        .then(setUrl)
        .catch(() => setUrl(order.paymentProofUrl));
    }
  }, [order.paymentProofStoragePath, order.paymentProofUrl]);

  if (!order.paymentProofStoragePath && !url) {
    return <p className="text-sm text-[var(--muted)]">No payment proof uploaded yet.</p>;
  }

  const isPdf = order.paymentProofFileType === "application/pdf";

  return (
    <Card className="space-y-4">
      {isPdf ? (
        <div className="flex items-center gap-3 rounded-md border border-[var(--border)] p-4">
          <FileText className="h-8 w-8 text-red-600" />
          <div>
            <p className="font-medium">PDF payment proof</p>
            <p className="text-sm text-[var(--muted)]">{order.paymentProofStoragePath}</p>
          </div>
        </div>
      ) : url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="max-h-[520px] w-full rounded-md object-contain" src={url} alt="Payment proof" />
      ) : (
        <p className="text-sm text-[var(--muted)]">Loading payment proof...</p>
      )}
      {url && (
        <div className="flex gap-2">
          <Button variant="secondary" type="button" onClick={() => window.open(url, "_blank")}>
            Open
          </Button>
          <a className="inline-flex h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-medium" href={url} download>
            Download
          </a>
        </div>
      )}
    </Card>
  );
}
