import { Pool } from 'pg';
import { ProductRepository } from './product.repository.interface';
import { PostgresProductRepository } from './postgres/product.repository';

// Singleton DB connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'express_crud',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Repository factory
export class RepositoryFactory {
  private static productRepository: ProductRepository;

  static getProductRepository(): ProductRepository {
    if (!this.productRepository) {
      this.productRepository = new PostgresProductRepository(pool);
    }
    return this.productRepository;
  }
  
  // Add method to close pool when application shuts down
  static async closeConnections(): Promise<void> {
    await pool.end();
  }
}