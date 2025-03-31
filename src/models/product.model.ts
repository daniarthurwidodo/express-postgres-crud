export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  stock: number;
  created_at: Date;
  updated_at: Date;
}