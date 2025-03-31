import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/product.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

// Product routes
app.use('/api/products', productRoutes);

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;