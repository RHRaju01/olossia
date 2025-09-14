import { Product } from '../models/Product.js';

export const productController = {
  // Get all products with filtering
  getProducts: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        brand,
        minPrice,
        maxPrice,
        search,
        sort = 'newest'
      } = req.query;

      const offset = (page - 1) * limit;
      
      const filters = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        categoryId: category,
        brandId: brand,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        search
      };

      const products = await Product.getAll(filters);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: products.length === parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products'
      });
    }
  },

  // Get single product
  getProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: { product }
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product'
      });
    }
  },

  // Get featured products
  getFeaturedProducts: async (req, res) => {
    try {
      const { limit = 6 } = req.query;
      const products = await Product.getFeatured(parseInt(limit));

      res.json({
        success: true,
        data: { products }
      });
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured products'
      });
    }
  },

  // Create product (admin/seller only)
  createProduct: async (req, res) => {
    try {
      const productData = {
        ...req.body,
        sellerId: req.user.role === 'seller' ? req.user.id : null
      };

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product }
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
    }
  }
};