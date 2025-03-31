import { Pool } from 'pg';
import { 
  ProductRepository, 
  ProductFilter, 
  PaginationOptions, 
  PaginatedResult 
} from '../product.repository.interface';
import { Product } from '../../models/product.model';

export class PostgresProductRepository implements ProductRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(
    filter?: ProductFilter, 
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    // Default pagination values
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;
    
    // Build the WHERE clause for filtering
    let whereClause = '';
    const queryParams: any[] = [];
    let paramCount = 1;
    
    if (filter?.name) {
      whereClause += `${whereClause ? ' AND ' : 'WHERE '} name ILIKE $${paramCount}`;
      queryParams.push(`%${filter.name}%`);
      paramCount++;
    }
    
    if (filter?.category) {
      whereClause += `${whereClause ? ' AND ' : 'WHERE '} category ILIKE $${paramCount}`;
      queryParams.push(`%${filter.category}%`);
      paramCount++;
    }
    
    if (filter?.minPrice) {
      whereClause += `${whereClause ? ' AND ' : 'WHERE '} price >= $${paramCount}`;
      queryParams.push(filter.minPrice);
      paramCount++;
    }
    
    if (filter?.maxPrice) {
      whereClause += `${whereClause ? ' AND ' : 'WHERE '} price <= $${paramCount}`;
      queryParams.push(filter.maxPrice);
      paramCount++;
    }
    
    // Add pagination parameters
    queryParams.push(limit);
    queryParams.push(offset);
    
    // Get filtered products with pagination
    const query = `
      SELECT * FROM products
      ${whereClause}
      ORDER BY id
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    // Count total matching records for pagination metadata
    const countQuery = `
      SELECT COUNT(*) FROM products
      ${whereClause}
    `;
    
    // Execute both queries
    const productsResult = await this.pool.query(query, queryParams);
    const countResult = await this.pool.query(
      countQuery, 
      queryParams.slice(0, paramCount - 1) // Exclude pagination params
    );
    
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      data: productsResult.rows,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async findById(id: number): Promise<Product | null> {
    const result = await this.pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async create(product: Partial<Product>): Promise<Product> {
    const { name, description, price, category, sku, stock } = product;
    const defaultSku = sku || `SKU${Date.now()}`;
    const defaultStock = stock || 0;
    
    const result = await this.pool.query(
      'INSERT INTO products (name, description, price, category, sku, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, category, defaultSku, defaultStock]
    );
    
    return result.rows[0];
  }

  async update(id: number, product: Partial<Product>): Promise<Product | null> {
    // First get the existing product
    const existingProduct = await this.findById(id);
    
    if (!existingProduct) {
      return null;
    }
    
    // Merge existing data with update data
    const updatedData = {
      name: product.name !== undefined ? product.name : existingProduct.name,
      description: product.description !== undefined ? product.description : existingProduct.description,
      price: product.price !== undefined ? product.price : existingProduct.price,
      category: product.category !== undefined ? product.category : existingProduct.category,
      sku: product.sku !== undefined ? product.sku : existingProduct.sku,
      stock: product.stock !== undefined ? product.stock : existingProduct.stock
    };
    
    // Update with merged data
    const result = await this.pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, category = $4, sku = $5, stock = $6, updated_at = NOW()
       WHERE id = $7 
       RETURNING *`,
      [
        updatedData.name, 
        updatedData.description, 
        updatedData.price, 
        updatedData.category,
        updatedData.sku,
        updatedData.stock,
        id
      ]
    );
    
    return result.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }
}