import categoryService from '../../services/admin/index.js';

class CategoryController {
  // Create category
  async createCategory(req, res) {
    try {
      const file = req.file;
      const category = await categoryService.category.createCategory(req.body, file);
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create category'
      });
    }
  }

  // Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;
      const category = await categoryService.category.updateCategory(id, req.body, file);
      
      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update category'
      });
    }
  }

  // Delete category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.category.deleteCategory(id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete category'
      });
    }
  }

  // Get single category
  async getCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.category.getCategory(id);
      
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get category'
      });
    }
  }

  // Get all categories
  async getCategories(req, res) {
    try {
      const categories = await categoryService.category.getCategories(req.query);
      
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get categories'
      });
    }
  }

  // Get category tree
  async getCategoryTree(req, res) {
    try {
      const categories = await categoryService.category.getCategoryTree();
      
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get category tree error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get category tree'
      });
    }
  }

  // Get category by slug
  async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;
      const category = await categoryService.category.getCategoryBySlug(slug);
      
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category by slug error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get category'
      });
    }
  }
}

export default new CategoryController();