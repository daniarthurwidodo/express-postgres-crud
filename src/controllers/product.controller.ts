import { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories/repository.factory';
import { ProductFilter } from '../repositories/product.repository.interface';

// Get the repository
const productRepository = RepositoryFactory.getProductRepository();

// Get all products with filtering and pagination
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Extract filter parameters
    const filter: ProductFilter = {};
    
    if (req.query.name) filter.name = req.query.name as string;
    if (req.query.category) filter.category = req.query.category as string;
    if (req.query.minPrice) filter.minPrice = parseFloat(req.query.minPrice as string);
    if (req.query.maxPrice) filter.maxPrice = parseFloat(req.query.maxPrice as string);
    
    const result = await productRepository.findAll(filter, { page, limit });
    res.status(200).json(result);
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
    
    const product = await productRepository.findById(id);
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const newProduct = await productRepository.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }
    
    const updatedProduct = await productRepository.update(id, req.body);
    
    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    res.status(200).json(updatedProduct);
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
    
    const deleted = await productRepository.delete(id);
    
    if (!deleted) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};