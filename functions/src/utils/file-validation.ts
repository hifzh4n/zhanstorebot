const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
]);

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

export const maxPaymentProofBytes = 5 * 1024 * 1024;

export const isAllowedPaymentProof = (mimeType: string): boolean => {
  return allowedMimeTypes.has(mimeType);
};

export const extensionForMimeType = (mimeType: string): string => {
  return extensionByMimeType[mimeType] ?? "bin";
};
