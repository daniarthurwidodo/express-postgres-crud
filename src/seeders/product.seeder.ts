import { faker } from '@faker-js/faker';
import { Pool } from 'pg';

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'express_crud',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function seedProducts(count: number = 2000) {
  const products = [];
  
  for (let i = 0; i < count; i++) {
    const product = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      stock: faker.number.int({ min: 0, max: 1000 }),
      created_at: faker.date.past(),
      updated_at: new Date()
    };
    products.push(product);
  }

  try {
    // Insert products in batches of 100
    for (let i = 0; i < products.length; i += 100) {
      const batch = products.slice(i, i + 100);
      const valueParams: any[] = [];
      const valuePlaceholders = batch.map((_, index) => {
        const offset = index * 8; // 8 is the number of columns
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`;
      }).join(',');

      batch.forEach(p => {
        valueParams.push(
          p.name,
          p.description,
          p.price,
          p.category,
          p.sku,
          p.stock,
          p.created_at,
          p.updated_at
        );
      });

      const query = `
        INSERT INTO products (
          name, description, price, category, sku, stock, created_at, updated_at
        ) VALUES ${valuePlaceholders};
      `;

      await pool.query(query, valueParams);
    }

    console.log(`✅ Successfully seeded ${count} products`);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await pool.end();
  }
}

// Run the seeder
seedProducts();