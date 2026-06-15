"use client";

import {collection, onSnapshot, orderBy, query} from "firebase/firestore";
import {useEffect, useState} from "react";
import {db} from "@/lib/firebase";
import {Product} from "@/types/product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name", "asc"));
    return onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((item) => item.data() as Product));
        setError(null);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError.message);
        setLoading(false);
      },
    );
  }, []);

  return {products, loading, error};
}
