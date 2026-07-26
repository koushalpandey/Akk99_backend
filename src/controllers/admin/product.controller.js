import productService from '../../services/admin/index.js';

class ProductController {
  // Create product
  async createProduct(req, res) {
    try {
      const files = req.files;
      const product = await productService.product.createProduct(req.body, files);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create product'
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const files = req.files;
      const product = await productService.product.updateProduct(id, req.body, files);
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update product'
      });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.product.deleteProduct(id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete product'
      });
    }
  }

  // Get single product
  async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.product.getProduct(id);
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get product'
      });
    }
  }

  // Get all products
  async getProducts(req, res) {
    try {
      const products = await productService.product.getProducts(req.query);
      
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get products'
      });
    }
  }

  // Update stock
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      const product = await productService.product.updateStock(id, quantity);
      
      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update stock'
      });
    }
  }
}

export default new ProductController();