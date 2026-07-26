import sliderService from '../../services/admin/index.js';

class SliderController {
  // Create slider
  async createSlider(req, res) {
    try {
      const file = req.file;
      const slider = await sliderService.slider.createSlider(req.body, file);
      res.status(201).json({
        success: true,
        message: 'Slider created successfully',
        data: slider
      });
    } catch (error) {
      console.error('Create slider error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create slider'
      });
    }
  }

  // Update slider
  async updateSlider(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;
      const slider = await sliderService.slider.updateSlider(id, req.body, file);
      res.status(200).json({
        success: true,
        message: 'Slider updated successfully',
        data: slider
      });
    } catch (error) {
      console.error('Update slider error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update slider'
      });
    }
  }

  // Delete slider
  async deleteSlider(req, res) {
    try {
      const { id } = req.params;
      const result = await sliderService.slider.deleteSlider(id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete slider error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete slider'
      });
    }
  }

  // Get single slider
  async getSlider(req, res) {
    try {
      const { id } = req.params;
      const slider = await sliderService.slider.getSlider(id);
      res.status(200).json({
        success: true,
        data: slider
      });
    } catch (error) {
      console.error('Get slider error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get slider'
      });
    }
  }

  // Get all sliders
  async getSliders(req, res) {
    try {
      const sliders = await sliderService.slider.getSliders(req.query);
      res.status(200).json({
        success: true,
        data: sliders
      });
    } catch (error) {
      console.error('Get sliders error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get sliders'
      });
    }
  }

  // Update slider order
  async updateSliderOrder(req, res) {
    try {
      const { id } = req.params;
      const { order } = req.body;
      const slider = await sliderService.slider.updateOrder(id, order);
      res.status(200).json({
        success: true,
        message: 'Slider order updated successfully',
        data: slider
      });
    } catch (error) {
      console.error('Update slider order error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update slider order'
      });
    }
  }

  // Update slider status
  async updateSliderStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const slider = await sliderService.slider.updateStatus(id, isActive);
      res.status(200).json({
        success: true,
        message: 'Slider status updated successfully',
        data: slider
      });
    } catch (error) {
      console.error('Update slider status error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update slider status'
      });
    }
  }

  // Get active sliders for frontend
  async getActiveSliders(req, res) {
    try {
      const sliders = await sliderService.slider.getActiveSliders();
      res.status(200).json({
        success: true,
        data: sliders
      });
    } catch (error) {
      console.error('Get active sliders error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get active sliders'
      });
    }
  }
}

export default new SliderController();