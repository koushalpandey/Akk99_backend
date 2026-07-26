import { PrismaClient } from '@prisma/client';
import { imagekit } from '../../config/imagekit.js';

const prisma = new PrismaClient();

class SettingsService {
  // Get setting by key
  async getSetting(key) {
    const setting = await prisma.setting.findUnique({
      where: { key }
    });
    return setting;
  }

  // Update or create setting
  async updateSetting(key, value, type = 'text', description = '') {
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(value), type, description, updatedAt: new Date() },
      create: { key, value: JSON.stringify(value), type, description }
    });
    return setting;
  }

  // Get login page image
  async getLoginImage() {
    const setting = await this.getSetting('login_image');
    return setting ? JSON.parse(setting.value || '{}') : null;
  }

  // Update login page image
  async updateLoginImage(file) {
    let imageData = null;
    
    if (file) {
      const existing = await this.getLoginImage();
      if (existing && existing.fileId) {
        await imagekit.deleteFile(existing.fileId);
      }

      const result = await imagekit.upload({
        file: file.buffer,
        fileName: `login-bg-${Date.now()}-${file.originalname}`,
        folder: '/settings',
        tags: ['login', 'background'],
        transformations: {
          quality: 80,
          format: 'webp'
        }
      });

      imageData = {
        original: result.url,
        thumbnail: `${result.url}?tr=w-200,h-200`,
        medium: `${result.url}?tr=w-800,h-600`,
        fileId: result.fileId,
        url: result.url
      };
    }

    await this.updateSetting('login_image', imageData, 'image', 'Login page background image');
    return imageData;
  }

  // Get all settings
  async getAllSettings() {
    const settings = await prisma.setting.findMany();
    const result = {};
    settings.forEach(setting => {
      if (setting.type === 'image' && setting.value) {
        result[setting.key] = JSON.parse(setting.value);
      } else {
        result[setting.key] = setting.value;
      }
    });
    return result;
  }
}

export default new SettingsService();