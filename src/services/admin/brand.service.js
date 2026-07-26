import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { imagekit } from '../../config/imagekit.js';

const prisma = new PrismaClient();

class BrandService {
  // Create brand
  async createBrand(data, file) {
    try {
      let uploadedLogo = null;
      
      // Upload logo to ImageKit
      if (file) {
        const result = await imagekit.upload({
          file: file.buffer,
          fileName: `brand-${Date.now()}-${file.originalname}`,
          folder: '/brands',
          tags: ['brand', data.name],
          transformations: {
            quality: 80,
            format: 'webp'
          }
        });
        
        uploadedLogo = {
          original: result.url,
          thumbnail: `${result.url}?tr=w-100,h-100`,
          medium: `${result.url}?tr=w-200,h-200`,
          fileId: result.fileId,
          url: result.url
        };
      }

      // Generate slug
      const slug = slugify(data.name, { lower: true, strict: true });

      // Create brand
      const brand = await prisma.brand.create({
        data: {
          name: data.name,
          slug: slug,
          logo: uploadedLogo ? JSON.stringify(uploadedLogo) : null,
          description: data.description,
          website: data.website,
          isActive: data.isActive === 'true' || data.isActive === true
        }
      });

      return brand;
    } catch (error) {
      throw error;
    }
  }

  // Update brand
  async updateBrand(id, data, file) {
    try {
      const existingBrand = await prisma.brand.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingBrand) {
        throw new Error('Brand not found');
      }

      let uploadedLogo = existingBrand.logo ? JSON.parse(existingBrand.logo) : null;

      // Handle new logo upload
      if (file) {
        // Delete old logo from ImageKit
        if (uploadedLogo && uploadedLogo.fileId) {
          await imagekit.deleteFile(uploadedLogo.fileId);
        }

        const result = await imagekit.upload({
          file: file.buffer,
          fileName: `brand-${Date.now()}-${file.originalname}`,
          folder: '/brands',
          tags: ['brand', data.name || existingBrand.name],
          transformations: {
            quality: 80,
            format: 'webp'
          }
        });
        
        uploadedLogo = {
          original: result.url,
          thumbnail: `${result.url}?tr=w-100,h-100`,
          medium: `${result.url}?tr=w-200,h-200`,
          fileId: result.fileId,
          url: result.url
        };
      }

      // Update brand
      const brand = await prisma.brand.update({
        where: { id: parseInt(id) },
        data: {
          name: data.name || existingBrand.name,
          slug: data.name ? slugify(data.name, { lower: true, strict: true }) : existingBrand.slug,
          logo: uploadedLogo ? JSON.stringify(uploadedLogo) : existingBrand.logo,
          description: data.description !== undefined ? data.description : existingBrand.description,
          website: data.website !== undefined ? data.website : existingBrand.website,
          isActive: data.isActive !== undefined ? (data.isActive === 'true' || data.isActive === true) : existingBrand.isActive
        }
      });

      return brand;
    } catch (error) {
      throw error;
    }
  }

  // Delete brand
  async deleteBrand(id) {
    try {
      const brand = await prisma.brand.findUnique({
        where: { id: parseInt(id) },
        include: { products: true }
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      if (brand.products.length > 0) {
        throw new Error('Cannot delete brand with associated products');
      }

      // Delete logo from ImageKit
      if (brand.logo) {
        const logoData = JSON.parse(brand.logo);
        if (logoData.fileId) {
          await imagekit.deleteFile(logoData.fileId);
        }
      }

      await prisma.brand.delete({
        where: { id: parseInt(id) }
      });

      return { message: 'Brand deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get single brand
  async getBrand(id) {
    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!brand) {
      throw new Error('Brand not found');
    }

    // Parse logo JSON if exists
    if (brand.logo) {
      brand.logo = JSON.parse(brand.logo);
    }

    return brand;
  }

  // Get all brands
  async getBrands(filters) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        include: {
          _count: {
            select: { products: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.brand.count({ where })
    ]);

    // Parse logos
    brands.forEach(brand => {
      if (brand.logo) {
        brand.logo = JSON.parse(brand.logo);
      }
    });

    return {
      brands,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  // Update brand status
  async updateStatus(id, isActive) {
    const brand = await prisma.brand.update({
      where: { id: parseInt(id) },
      data: { isActive: isActive === 'true' || isActive === true }
    });

    return brand;
  }
}

export default new BrandService();