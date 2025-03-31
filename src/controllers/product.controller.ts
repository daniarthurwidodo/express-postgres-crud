import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'express_crud',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Get all products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await pool.query('SELECT * FROM products');
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }
    
    const response = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (response.rows.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, sku, stock } = req.body;
    
    // Using all fields from the request
    const response = await pool.query(
      'INSERT INTO products (name, description, price, category, sku, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, category, sku || `SKU${Date.now()}`, stock || 0]
    );
    
    res.status(201).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    // First, get the existing product
    const existingProduct = await pool.query(
      'SELECT * FROM products WHERE id = $1', 
      [id]
    );
    
    if (existingProduct.rows.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    // Merge existing data with update data
    const currentProduct = existingProduct.rows[0];
    const updatedData = {
      name: req.body.name !== undefined ? req.body.name : currentProduct.name,
      description: req.body.description !== undefined ? req.body.description : currentProduct.description,
      price: req.body.price !== undefined ? req.body.price : currentProduct.price,
      category: req.body.category !== undefined ? req.body.category : currentProduct.category,
      sku: req.body.sku !== undefined ? req.body.sku : currentProduct.sku,
      stock: req.body.stock !== undefined ? req.body.stock : currentProduct.stock
    };
    
    // Update with merged data
    const response = await pool.query(
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
    
    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a product by ID
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }
    
    const response = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (response.rows.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};