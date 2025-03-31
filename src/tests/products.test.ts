import request from 'supertest';
import app from '../app';
import { pool } from '../db'; // Adjust this path based on your project structure

// Test product data
const testProduct = {
  name: 'Test Product',
  description: 'This is a test product',
  price: 99.99,
  category: 'Testing',
  sku: 'TEST0001' // Add the required SKU field
};

let productId: number;

// Clean up the database before and after tests
beforeAll(async () => {
  // Clear test data or set up test database
  await pool.query('DELETE FROM products WHERE name = $1', [testProduct.name]);
});

afterAll(async () => {
  // Clean up test data
  await pool.query('DELETE FROM products WHERE name = $1', [testProduct.name]);
  await pool.end();
});

describe('Products API', () => {
  // Test creating a product
  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(testProduct);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(testProduct.name);
      
      // Save the ID for later tests
      productId = response.body.id;
    });
  });

  // Test getting all products
  describe('GET /api/products', () => {
    it('should return a list of products', async () => {
      const response = await request(app).get('/api/products');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // Test getting a single product
  describe('GET /api/products/:id', () => {
    it('should return a single product by id', async () => {
      // Skip if no product was created
      if (!productId) {
        return;
      }
      
      const response = await request(app).get(`/api/products/${productId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', productId);
      expect(response.body.name).toBe(testProduct.name);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/9999999');
      
      expect(response.status).toBe(404);
    });
  });

  // Test updating a product
  describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
      // Skip if no product was created
      if (!productId) {
        return;
      }
      
      const updatedData = {
        name: 'Updated Test Product',
        price: 199.99
      };
      
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedData.name);
      // Fix the type comparison - either parse the string to a number or compare with the string value
      expect(parseFloat(response.body.price)).toBe(updatedData.price);
      // Description should remain unchanged
      expect(response.body.description).toBe(testProduct.description);
    });
  });

  // Test deleting a product
  describe('DELETE /api/products/:id', () => {
    it('should delete an existing product', async () => {
      // Skip if no product was created
      if (!productId) {
        return;
      }
      
      const response = await request(app).delete(`/api/products/${productId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      
      // Verify it's deleted
      const getResponse = await request(app).get(`/api/products/${productId}`);
      expect(getResponse.status).toBe(404);
    });
  });
});