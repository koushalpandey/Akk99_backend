import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { imagekit } from '../../config/imagekit.js';

const prisma = new PrismaClient();

class CategoryService {
  // Create category
  async createCategory(data, file) {
    try {
      let uploadedImage = null;
      
      // Upload image to ImageKit
      if (file) {
        const result = await imagekit.upload({
          file: file.buffer,
          fileName: `category-${Date.now()}-${file.originalname}`,
          folder: '/categories',
          tags: ['category', data.name],
          transformations: {
            quality: 80,
            format: 'webp'
          }
        });
        
        uploadedImage = {
          original: result.url,
          thumbnail: `${result.url}?tr=w-100,h-100`,
          medium: `${result.url}?tr=w-200,h-200`,
          fileId: result.fileId,
          url: result.url
        };
      }

      // Generate slug
      const slug = slugify(data.name, { lower: true, strict: true });

      // Get parent category path if exists
      let path = slug;
      let level = 0;
      
      if (data.parentId) {
        const parent = await prisma.category.findUnique({
          where: { id: parseInt(data.parentId) }
        });
        if (parent) {
          path = `${parent.path}/${slug}`;
          level = parent.level + 1;
        }
      }

      // Create category
      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug: slug,
          description: data.description,
          image: uploadedImage ? JSON.stringify(uploadedImage) : null,
          parentId: data.parentId ? parseInt(data.parentId) : null,
          level: level,
          path: path
        },
        include: {
          parent: true,
          children: true
        }
      });

      return category;
    } catch (error) {
      throw error;
    }
  }

  // Update category
  async updateCategory(id, data, file) {
    try {
      const existingCategory = await prisma.category.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingCategory) {
        throw new Error('Category not found');
      }

      let uploadedImage = existingCategory.image ? JSON.parse(existingCategory.image) : null;

      // Handle new image upload
      if (file) {
        // Delete old image from ImageKit
        if (uploadedImage && uploadedImage.fileId) {
          await imagekit.deleteFile(uploadedImage.fileId);
        }

        const result = await imagekit.upload({
          file: file.buffer,
          fileName: `category-${Date.now()}-${file.originalname}`,
          folder: '/categories',
          tags: ['category', data.name || existingCategory.name],
          transformations: {
            quality: 80,
            format: 'webp'
          }
        });
        
        uploadedImage = {
          original: result.url,
          thumbnail: `${result.url}?tr=w-100,h-100`,
          medium: `${result.url}?tr=w-200,h-200`,
          fileId: result.fileId,
          url: result.url
        };
      }

      // Update category
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: {
          name: data.name || existingCategory.name,
          slug: data.name ? slugify(data.name, { lower: true, strict: true }) : existingCategory.slug,
          description: data.description !== undefined ? data.description : existingCategory.description,
          image: uploadedImage ? JSON.stringify(uploadedImage) : existingCategory.image,
          parentId: data.parentId !== undefined ? (data.parentId ? parseInt(data.parentId) : null) : existingCategory.parentId
        },
        include: {
          parent: true,
          children: true
        }
      });

      return category;
    } catch (error) {
      throw error;
    }
  }

  // Delete category
  async deleteCategory(id) {
    try {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: { 
          children: true,
          products: true 
        }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      if (category.children.length > 0) {
        throw new Error('Cannot delete category with subcategories');
      }

      if (category.products.length > 0) {
        throw new Error('Cannot delete category with associated products');
      }

      // Delete image from ImageKit
      if (category.image) {
        const imageData = JSON.parse(category.image);
        if (imageData.fileId) {
          await imagekit.deleteFile(imageData.fileId);
        }
      }

      await prisma.category.delete({
        where: { id: parseInt(id) }
      });

      return { message: 'Category deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get single category
  async getCategory(id) {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        },
        products: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Parse image JSON if exists
    if (category.image) {
      category.image = JSON.parse(category.image);
    }

    return category;
  }

  // Get all categories
  async getCategories(filters) {
    const {
      page = 1,
      limit = 10,
      search,
      parentId,
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

    if (parentId !== undefined && parentId !== '') {
      where.parentId = parentId === 'null' ? null : parseInt(parentId);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          parent: true,
          children: {
            include: {
              _count: {
                select: { products: true }
              }
            }
          },
          _count: {
            select: { products: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.category.count({ where })
    ]);

    // Parse images
    categories.forEach(category => {
      if (category.image) {
        category.image = JSON.parse(category.image);
      }
    });

    return {
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  // Get category tree (all categories with hierarchy)
  async getCategoryTree() {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        }
      }
    });

    return categories;
  }

  // Get category by slug
  async getCategoryBySlug(slug) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.image) {
      category.image = JSON.parse(category.image);
    }

    return category;
  }
}

export default new CategoryService();