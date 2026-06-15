export interface Product {
  id: string;
  name: string;
  brand: string;
  serviceName: string;
  price: number;
  currency: "MYR";
  description: string;
  imageUrl?: string;
  imageStoragePath?: string;
  isActive: boolean;
}
