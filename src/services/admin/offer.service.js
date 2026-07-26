import { PrismaClient } from '@prisma/client';
import { imagekit } from '../../config/imagekit.js';

const prisma = new PrismaClient();

class OfferService {
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

  // Get offer
  async getOffer() {
    const setting = await this.getSetting('offer');
    return setting ? JSON.parse(setting.value || '{}') : null;
  }

  // Update offer with image
  async updateOffer(file, offerData = {}) {
    let imageData = null;
    
    if (file) {
      const existing = await this.getOffer();
      if (existing && existing.fileId) {
        await imagekit.deleteFile(existing.fileId);
      }

      const result = await imagekit.upload({
        file: file.buffer,
        fileName: `offer-${Date.now()}-${file.originalname}`,
        folder: '/offers',
        tags: ['offer', 'promotion'],
        transformations: {
          quality: 80,
          format: 'webp'
        }
      });

      imageData = {
        original: result.url,
        large: `${result.url}?tr=w-1200,h-600`,
        medium: `${result.url}?tr=w-800,h-400`,
        small: `${result.url}?tr=w-400,h-200`,
        thumbnail: `${result.url}?tr=w-200,h-100`,
        fileId: result.fileId,
        url: result.url,
        title: offerData.title || '',
        subtitle: offerData.subtitle || '',
        discount: offerData.discount || '',
        link: offerData.link || '',
        validUntil: offerData.validUntil || ''
      };
    } else {
      const existing = await this.getOffer();
      imageData = {
        ...existing,
        title: offerData.title || existing?.title || '',
        subtitle: offerData.subtitle || existing?.subtitle || '',
        discount: offerData.discount || existing?.discount || '',
        link: offerData.link || existing?.link || '',
        validUntil: offerData.validUntil || existing?.validUntil || ''
      };
    }

    await this.updateSetting('offer', imageData, 'image', 'Offer banner');
    return imageData;
  }

  // Update offer details only (without image)
  async updateOfferDetails(offerData) {
    const existing = await this.getOffer();
    
    const updatedOffer = {
      ...existing,
      title: offerData.title !== undefined ? offerData.title : existing?.title || '',
      subtitle: offerData.subtitle !== undefined ? offerData.subtitle : existing?.subtitle || '',
      discount: offerData.discount !== undefined ? offerData.discount : existing?.discount || '',
      link: offerData.link !== undefined ? offerData.link : existing?.link || '',
      validUntil: offerData.validUntil !== undefined ? offerData.validUntil : existing?.validUntil || ''
    };

    await this.updateSetting('offer', updatedOffer, 'image', 'Offer banner');
    return updatedOffer;
  }
}

export default new OfferService();