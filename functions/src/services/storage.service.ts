import {getBucket} from "../firebase";

export const savePaymentProof = async (params: {
  buffer: Buffer;
  contentType: string;
  storagePath: string;
}): Promise<string> => {
  const file = getBucket().file(params.storagePath);
  await file.save(params.buffer, {
    contentType: params.contentType,
    resumable: false,
    metadata: {
      cacheControl: "private, max-age=0",
    },
  });
  return `gs://${getBucket().name}/${params.storagePath}`;
};

export const readStorageFile = async (storagePath: string): Promise<{
  buffer: Buffer;
  contentType: string;
  fileName: string;
}> => {
  const file = getBucket().file(storagePath);
  const [metadata] = await file.getMetadata();
  const [buffer] = await file.download();
  return {
    buffer,
    contentType: metadata.contentType ?? "application/octet-stream",
    fileName: storagePath.split("/").pop() ?? "file",
  };
};
