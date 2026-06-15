import {Timestamp} from "firebase-admin/firestore";
import {db} from "../firebase";

export const recordPaymentProof = async (params: {
  orderId: string;
  telegramUserId: string;
  fileUrl: string;
  storagePath: string;
  fileType: string;
  fileName: string;
  fileSize: number;
}): Promise<void> => {
  const proofId = `PROOF-${params.orderId}-${Date.now()}`;
  await db.collection("paymentProofs").doc(proofId).set({
    proofId,
    orderId: params.orderId,
    telegramUserId: params.telegramUserId,
    fileUrl: params.fileUrl,
    storagePath: params.storagePath,
    fileType: params.fileType,
    fileName: params.fileName,
    fileSize: params.fileSize,
    uploadedAt: Timestamp.now(),
  });
};
