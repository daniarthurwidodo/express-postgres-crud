import { Product } from '../models/product.model';

export interface ProductFilter {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductRepository {
  findAll(filter?: ProductFilter, pagination?: PaginationOptions): Promise<PaginatedResult<Product>>;
  findById(id: number): Promise<Product | null>;
  create(product: Partial<Product>): Promise<Product>;
  update(id: number, product: Partial<Product>): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
}