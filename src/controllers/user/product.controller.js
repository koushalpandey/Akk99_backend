import productService from '../../services/user/index.js';

const productController = {
  // Get all products
  async getAllProducts(req, res) {
    try {
      const { category, search, minPrice, maxPrice, sort, page, limit } = req.query;

      const result = await productService.product.getAllProducts({
        category,
        search,
        minPrice,
        maxPrice,
        sort,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all products error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get product by slug
  async getProductBySlug(req, res) {
    try {
      const { slug } = req.params;

      const product = await productService.product.getProductBySlug(slug);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product by slug error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const product = await productService.product.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await productService.product.getAllCategories();

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get category by slug
  async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;

      const category = await productService.product.getCategoryBySlug(slug);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get all brands
  async getAllBrands(req, res) {
    try {
      const brands = await productService.product.getAllBrands();

      res.status(200).json({
        success: true,
        data: brands
      });
    } catch (error) {
      console.error('Get brands error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get featured products
  async getFeaturedProducts(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const products = await productService.product.getFeaturedProducts(limit);

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get products by category
  async getProductsByCategory(req, res) {
    try {
      const { slug } = req.params;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;

      const result = await productService.product.getProductsByCategory(slug, page, limit);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get product reviews
  async getProductReviews(req, res) {
    try {
      const { id } = req.params;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;

      const result = await productService.product.getProductReviews(id, page, limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get product reviews error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Search products
  async searchProducts(req, res) {
    try {
      const { q, page, limit } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const result = await productService.product.searchProducts(
        q,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 20
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },
  async getSlider(req, res) {
    try {
      const slider = await productService.product.getActiveSliders()
      return res.status(200).json({
        message: "success",
        data: slider
      })

    } catch (error) {
      console.error('slider controller error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

export default productController;