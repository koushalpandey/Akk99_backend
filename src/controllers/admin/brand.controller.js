import brandService from '../../services/admin/index.js';

class BrandController {
  // Create brand
  async createBrand(req, res) {
    try {
      const file = req.file;
      const brand = await brandService.brand.createBrand(req.body, file);
      
      res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        data: brand
      });
    } catch (error) {
      console.error('Create brand error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create brand'
      });
    }
  }

  // Update brand
  async updateBrand(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;
      const brand = await brandService.brand.updateBrand(id, req.body, file);
      
      res.status(200).json({
        success: true,
        message: 'Brand updated successfully',
        data: brand
      });
    } catch (error) {
      console.error('Update brand error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update brand'
      });
    }
  }

  // Delete brand
  async deleteBrand(req, res) {
    try {
      const { id } = req.params;
      const result = await brandService.brand.deleteBrand(id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete brand error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete brand'
      });
    }
  }

  // Get single brand
  async getBrand(req, res) {
    try {
      const { id } = req.params;
      const brand = await brandService.brand.getBrand(id);
      
      res.status(200).json({
        success: true,
        data: brand
      });
    } catch (error) {
      console.error('Get brand error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get brand'
      });
    }
  }

  // Get all brands
  async getBrands(req, res) {
    try {
      const brands = await brandService.brand.getBrands(req.query);
      
      res.status(200).json({
        success: true,
        data: brands
      });
    } catch (error) {
      console.error('Get brands error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get brands'
      });
    }
  }

  // Update brand status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const brand = await brandService.brand.updateStatus(id, isActive);
      
      res.status(200).json({
        success: true,
        message: 'Brand status updated successfully',
        data: brand
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update status'
      });
    }
  }
}

export default new BrandController();