import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { imagekit, uploadOptions } from '../../config/imagekit.js';

const prisma = new PrismaClient();

class ProductService {
  // Create product
  async createProduct(data, files) {
    try {
      // Upload images to ImageKit
      let uploadedImages = [];
      if (files && files.length > 0) {
        uploadedImages = await Promise.all(
          files.map(async (file) => {
            const result = await imagekit.upload({
              file: file.buffer,
              fileName: `${Date.now()}-${file.originalname}`,
              folder: '/products',
              tags: ['product', data.name],
              transformations: {
                quality: 80,
                format: 'webp'
              }
            });
            return {
              original: result.url,
              thumbnail: `${result.url}?tr=w-200,h-200`,
              medium: `${result.url}?tr=w-500,h-500`,
              large: `${result.url}?tr=w-1000,h-1000`,
              fileId: result.fileId,
              url: result.url
            };
          })
        );
      }

      // Generate slug
      const slug = slugify(data.name, { lower: true, strict: true });

      // Create product
      const product = await prisma.product.create({
        data: {
          name: data.name,
          slug: slug,
          description: data.description,
          shortDescription: data.shortDescription,
          price: parseFloat(data.price),
          comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
          costPerItem: data.costPerItem ? parseFloat(data.costPerItem) : null,
          sku: data.sku,
          barcode: data.barcode,
          quantity: parseInt(data.quantity) || 0,
          trackQuantity: data.trackQuantity === 'true',
          weight: data.weight ? parseFloat(data.weight) : null,
          status: data.status || 'DRAFT',
          visibility: data.visibility || 'PUBLIC',
          featured: data.featured === 'true',
          images: uploadedImages,
          video: data.video || null,
          tags: data.tags ? data.tags.split(',') : [],
          brandId: data.brandId ? parseInt(data.brandId) : null,
          categoryId: data.categoryId ? parseInt(data.categoryId) : null,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          metaKeywords: data.metaKeywords
        },
        include: {
          brand: true,
          category: true,
          variants: true,
          attributes: true
        }
      });

      // Add variants if provided
      if (data.variants && JSON.parse(data.variants).length > 0) {
        const variants = JSON.parse(data.variants);
        await Promise.all(
          variants.map(variant =>
            prisma.productVariant.create({
              data: {
                productId: product.id,
                sku: variant.sku,
                price: parseFloat(variant.price),
                comparePrice: variant.comparePrice ? parseFloat(variant.comparePrice) : null,
                quantity: parseInt(variant.quantity) || 0,
                attributes: variant.attributes
              }
            })
          )
        );
      }

      // Add attributes if provided
      if (data.attributes && JSON.parse(data.attributes).length > 0) {
        const attributes = JSON.parse(data.attributes);
        await Promise.all(
          attributes.map(attr =>
            prisma.productAttribute.create({
              data: {
                productId: product.id,
                name: attr.name,
                value: attr.value
              }
            })
          )
        );
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Update product
  async updateProduct(id, data, files) {
    try {
      const existingProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Handle new images
      let uploadedImages = existingProduct.images || [];
      if (files && files.length > 0) {
        const newImages = await Promise.all(
          files.map(async (file) => {
            const result = await imagekit.upload({
              file: file.buffer,
              fileName: `${Date.now()}-${file.originalname}`,
              folder: '/products',
              tags: ['product', data.name || existingProduct.name],
              transformations: {
                quality: 80,
                format: 'webp'
              }
            });
            return {
              original: result.url,
              thumbnail: `${result.url}?tr=w-200,h-200`,
              medium: `${result.url}?tr=w-500,h-500`,
              large: `${result.url}?tr=w-1000,h-1000`,
              fileId: result.fileId,
              url: result.url
            };
          })
        );
        uploadedImages = [...uploadedImages, ...newImages];
      }

      // Handle image deletion
      if (data.deleteImages) {
        const deleteImageIds = JSON.parse(data.deleteImages);
        for (const fileId of deleteImageIds) {
          await imagekit.deleteFile(fileId);
        }
        uploadedImages = uploadedImages.filter(img => !deleteImageIds.includes(img.fileId));
      }

      // Update product
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          name: data.name || existingProduct.name,
          slug: data.name ? slugify(data.name, { lower: true, strict: true }) : existingProduct.slug,
          description: data.description !== undefined ? data.description : existingProduct.description,
          shortDescription: data.shortDescription !== undefined ? data.shortDescription : existingProduct.shortDescription,
          price: data.price ? parseFloat(data.price) : existingProduct.price,
          comparePrice: data.comparePrice !== undefined ? (data.comparePrice ? parseFloat(data.comparePrice) : null) : existingProduct.comparePrice,
          costPerItem: data.costPerItem !== undefined ? (data.costPerItem ? parseFloat(data.costPerItem) : null) : existingProduct.costPerItem,
          sku: data.sku || existingProduct.sku,
          barcode: data.barcode || existingProduct.barcode,
          quantity: data.quantity !== undefined ? parseInt(data.quantity) : existingProduct.quantity,
          trackQuantity: data.trackQuantity !== undefined ? data.trackQuantity === 'true' : existingProduct.trackQuantity,
          weight: data.weight !== undefined ? (data.weight ? parseFloat(data.weight) : null) : existingProduct.weight,
          status: data.status || existingProduct.status,
          visibility: data.visibility || existingProduct.visibility,
          featured: data.featured !== undefined ? data.featured === 'true' : existingProduct.featured,
          images: uploadedImages,
          video: data.video !== undefined ? data.video : existingProduct.video,
          tags: data.tags ? data.tags.split(',') : existingProduct.tags,
          brandId: data.brandId !== undefined ? (data.brandId ? parseInt(data.brandId) : null) : existingProduct.brandId,
          categoryId: data.categoryId !== undefined ? (data.categoryId ? parseInt(data.categoryId) : null) : existingProduct.categoryId,
          seoTitle: data.seoTitle !== undefined ? data.seoTitle : existingProduct.seoTitle,
          seoDescription: data.seoDescription !== undefined ? data.seoDescription : existingProduct.seoDescription,
          metaKeywords: data.metaKeywords !== undefined ? data.metaKeywords : existingProduct.metaKeywords
        },
        include: {
          brand: true,
          category: true,
          variants: true,
          attributes: true
        }
      });

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: { variants: true }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Delete images from ImageKit
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          await imagekit.deleteFile(image.fileId);
        }
      }

      // Delete product (cascades to variants, attributes, etc.)
      await prisma.product.delete({
        where: { id: parseInt(id) }
      });

      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get single product
  async getProduct(id) {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        brand: true,
        category: true,
        variants: true,
        attributes: true,
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: { name: true, picture: true }
            }
          }
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  // Get all products with filters
  async getProducts(filters) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (brandId) where.brandId = parseInt(brandId);
    if (featured === 'true') where.featured = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          variants: true,
          _count: {
            select: { reviews: true, orderItems: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  // Update stock
  async updateStock(id, quantity) {
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { quantity: parseInt(quantity) }
    });

    return product;
  }
}

export default new ProductService();