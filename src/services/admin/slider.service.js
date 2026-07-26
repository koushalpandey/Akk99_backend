import { PrismaClient } from '@prisma/client';
import { imagekit } from '../../config/imagekit.js';

const prisma = new PrismaClient();

class SliderService {
  // Create slider
  async createSlider(data, file) {
    let imageData = null;

    if (file) {
      const result = await imagekit.upload({
        file: file.buffer,
        fileName: `slider-${Date.now()}-${file.originalname}`,
        folder: '/sliders',
        tags: ['slider', data.title || 'slider'],
        transformations: {
          quality: 80,
          format: 'webp'
        }
      });

      imageData = {
        original: result.url,
        large: `${result.url}?tr=w-1920,h-800`,
        medium: `${result.url}?tr=w-1024,h-500`,
        small: `${result.url}?tr=w-768,h-400`,
        thumbnail: `${result.url}?tr=w-200,h-150`,
        fileId: result.fileId,
        url: result.url
      };
    }

    const slider = await prisma.slider.create({
      data: {
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        image: JSON.stringify(imageData),
        link: data.link || '',
        order: parseInt(data.order) || 0,
        isActive: data.isActive === 'true' || data.isActive === true
      }
    });

    if (slider.image) {
      slider.image = JSON.parse(slider.image);
    }

    return slider;
  }

  // Update slider
  async updateSlider(id, data, file) {
    const existingSlider = await prisma.slider.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSlider) {
      throw new Error('Slider not found');
    }

    let imageData = existingSlider.image ? JSON.parse(existingSlider.image) : null;

    if (file) {
      if (imageData && imageData.fileId) {
        await imagekit.deleteFile(imageData.fileId);
      }

      const result = await imagekit.upload({
        file: file.buffer,
        fileName: `slider-${Date.now()}-${file.originalname}`,
        folder: '/sliders',
        tags: ['slider', data.title || 'slider'],
        transformations: {
          quality: 80,
          format: 'webp'
        }
      });

      imageData = {
        original: result.url,
        large: `${result.url}?tr=w-1920,h-800`,
        medium: `${result.url}?tr=w-1024,h-500`,
        small: `${result.url}?tr=w-768,h-400`,
        thumbnail: `${result.url}?tr=w-200,h-150`,
        fileId: result.fileId,
        url: result.url
      };
    }

    const slider = await prisma.slider.update({
      where: { id: parseInt(id) },
      data: {
        title: data.title !== undefined ? data.title : existingSlider.title,
        subtitle: data.subtitle !== undefined ? data.subtitle : existingSlider.subtitle,
        description: data.description !== undefined ? data.description : existingSlider.description,
        image: imageData ? JSON.stringify(imageData) : existingSlider.image,
        link: data.link !== undefined ? data.link : existingSlider.link,
        order: data.order !== undefined ? parseInt(data.order) : existingSlider.order,
        isActive: data.isActive !== undefined ? (data.isActive === 'true' || data.isActive === true) : existingSlider.isActive
      }
    });

    if (slider.image) {
      slider.image = JSON.parse(slider.image);
    }

    return slider;
  }

  // Delete slider
  async deleteSlider(id) {
    const slider = await prisma.slider.findUnique({
      where: { id: parseInt(id) }
    });

    if (!slider) {
      throw new Error('Slider not found');
    }

    if (slider.image) {
      const imageData = JSON.parse(slider.image);
      if (imageData.fileId) {
        await imagekit.deleteFile(imageData.fileId);
      }
    }

    await prisma.slider.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Slider deleted successfully' };
  }

  // Get single slider
  async getSlider(id) {
    const slider = await prisma.slider.findUnique({
      where: { id: parseInt(id) }
    });

    if (!slider) {
      throw new Error('Slider not found');
    }

    if (slider.image) {
      slider.image = JSON.parse(slider.image);
    }

    return slider;
  }

  // Get all sliders
  async getSliders(filters) {
    const {
      page = 1,
      limit = 10,
      isActive,
      sortBy = 'order',
      sortOrder = 'asc'
    } = filters;

    const where = {};
    if (isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sliders, total] = await Promise.all([
      prisma.slider.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.slider.count({ where })
    ]);

    sliders.forEach(slider => {
      if (slider.image) {
        slider.image = JSON.parse(slider.image);
      }
    });

    return {
      sliders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  // Update slider order
  async updateOrder(id, order) {
    const slider = await prisma.slider.update({
      where: { id: parseInt(id) },
      data: { order: parseInt(order) }
    });
    return slider;
  }

  // Update slider status
  async updateStatus(id, isActive) {
    const slider = await prisma.slider.update({
      where: { id: parseInt(id) },
      data: { isActive: isActive === 'true' || isActive === true }
    });
    return slider;
  }


}

export default new SliderService();