import settingsService from '../../services/admin/index.js';

class SettingsController {
  // Get login image
  async getLoginImage(req, res) {
    try {
      const image = await settingsService.setting.getLoginImage();
      res.status(200).json({
        success: true,
        data: image
      });
    } catch (error) {
      console.error('Get login image error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get login image'
      });
    }
  }

  // Update login image
  async updateLoginImage(req, res) {
    try {
      const file = req.file;
      const image = await settingsService.setting.updateLoginImage(file);
      res.status(200).json({
        success: true,
        message: 'Login image updated successfully',
        data: image
      });
    } catch (error) {
      console.error('Update login image error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update login image'
      });
    }
  }

  // Get all settings
  async getAllSettings(req, res) {
    try {
      const settings = await settingsService.setting.getAllSettings();
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Get all settings error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get settings'
      });
    }
  }
}

export default new SettingsController();