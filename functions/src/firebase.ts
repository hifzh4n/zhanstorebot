import {initializeApp, getApps} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";

if (getApps().length === 0) {
  initializeApp();
}

export const db = getFirestore();

export const getBucket = () => {
  if (!process.env.APP_STORAGE_BUCKET) {
    throw new Error("APP_STORAGE_BUCKET is required");
  }
  return getStorage().bucket(process.env.APP_STORAGE_BUCKET);
};
