import express from 'express';
import { productController } from '../controllers/productController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validateProduct } from '../middleware/validation.js';

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, productController.getProducts);
router.get('/featured', optionalAuth, productController.getFeaturedProducts);
router.get('/:id', optionalAuth, productController.getProduct);

// Protected routes
router.post('/', 
  authenticate, 
  authorize('admin', 'seller'), 
  validateProduct, 
  productController.createProduct
);

export default router;