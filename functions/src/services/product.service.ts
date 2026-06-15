import {Timestamp} from "firebase-admin/firestore";
import {db} from "../firebase";
import {PRODUCTS} from "../constants/products";
import {Product} from "../types/product";

const collection = db.collection("products");

export const seedProducts = async (): Promise<void> => {
  const now = Timestamp.now();
  await Promise.all(
    PRODUCTS.map(async (product) => {
      const ref = collection.doc(product.id);
      const snap = await ref.get();
      if (!snap.exists) {
        await ref.set({
          ...product,
          createdAt: now,
          updatedAt: now,
        });
        return;
      }
      const existing = snap.data() ?? {};
      const defaults: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(product)) {
        if (existing[key] === undefined || existing[key] === "") {
          defaults[key] = value;
        }
      }
      if (Object.keys(defaults).length) {
        await ref.set({...defaults, updatedAt: now}, {merge: true});
      }
    }),
  );
};

export const listActiveProducts = async (): Promise<Product[]> => {
  await seedProducts();
  const snap = await collection.where("isActive", "==", true).get();
  const products = snap.docs.map((doc) => doc.data() as Product);
  return products.sort((a, b) => a.name.localeCompare(b.name));
};

export const getProduct = async (
  productId: string,
): Promise<Product | null> => {
  await seedProducts();
  const snap = await collection.doc(productId).get();
  if (!snap.exists) {
    return null;
  }
  return snap.data() as Product;
};
