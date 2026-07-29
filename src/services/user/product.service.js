import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const productService = {
  // Get all products (public)
  async getAllProducts(filters = {}) {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC'
    };

    if (category) {
      where.categoryId = parseInt(category);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = {};
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };
    if (sort === 'popular') orderBy = { reviews: { _count: 'desc' } };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          brand: true,
          variants: true,
          reviews: {
            where: { isApproved: true },
            select: { rating: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Get single product by slug
  async getProductBySlug(slug) {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
      },
      include: {
        category: true,
        brand: true,
        variants: true,
        attributes: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                picture: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) return null;

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    return {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10
    };
  },

  // Get product by ID
  async getProductById(id) {
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id),
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
      },
      include: {
        category: true,
        brand: true,
        variants: true,
        attributes: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                picture: true
              }
            }
          }
        }
      }
    });

    if (!product) return null;

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    return {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10
    };
  },

  // Get all categories
  async getAllCategories() {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    categories.forEach(cat => {
      if (cat.image) {
        cat.image = JSON.parse(cat.image);
      }
    });
    return categories
  },

  // Get category by slug
  async getCategoryBySlug(slug) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: "PUBLISHED" },
          take: 20,
        },
        children: true,
        parent: true,
      },
    });

    if (!category) return null;
    category.image = category.image ? JSON.parse(category.image) : null;
    return category;
  },
  // Get all brands
  async getAllBrands() {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return brands;
  },

  // Get featured products
  async getFeaturedProducts(limit = 10) {
    const products = await prisma.product.findMany({
      where: {
        featured: true,
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
      },
      take: limit,
      include: {
        category: true,
        brand: true,
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return products;
  },

  // Get products by category
  async getProductsByCategory(categorySlug, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    });

    if (!category) return null;

    const where = {
      categoryId: category.id,
      status: 'PUBLISHED',
      visibility: 'PUBLIC'
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          brand: true,
          variants: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return {
      category,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Get product reviews
  async getProductReviews(productId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId: parseInt(productId),
          isApproved: true
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              picture: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({
        where: {
          productId: parseInt(productId),
          isApproved: true
        }
      })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Search products
  async searchProducts(q, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } }
      ]
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        q
      }
    };
  },

  // Get active sliders 
  async getActiveSliders() {
    const sliders = await prisma.slider.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    sliders.forEach(slider => {
      if (slider.image) {
        slider.image = JSON.parse(slider.image);
      }
    });

    return sliders;
  }
};

export default productService;