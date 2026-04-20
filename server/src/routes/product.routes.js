const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/products — list all active products
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { active: true };
    if (category) where.category = { slug: category };
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, reviews: { select: { rating: true } } },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map((p) => ({
      ...p,
      averageRating: p.reviews.length
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0,
      reviewCount: p.reviews.length,
    }));

    res.json({
      success: true,
      products: productsWithRating,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// GET /api/products/categories/all — must be BEFORE /:slug
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// GET /api/products/:slug — single product
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        supplier: { select: { name: true } },
        reviews: { include: { user: { select: { name: true } } } },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// POST /api/products — create product (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, price, costPrice, stock, imageUrl, images, categoryId, featured } = req.body;

    // Get or create a default supplier so admin doesn't need to manage suppliers manually
    let supplier = await prisma.supplier.findFirst();
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: 'Default Supplier',
          email: 'supplier@dropke.com',
          country: 'Kenya',
        },
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice) || 0,
        stock: parseInt(stock),
        imageUrl,
        images: images || [],
        featured: featured || false,
        categoryId,
        supplierId: supplier.id,
      },
    });

    // Notify all connected clients of new product in real-time
    req.app.get('io').emit('product:new', product);

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'A product with this slug already exists. Try a different name.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

// PATCH /api/products/:id — update product (admin only)
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    req.app.get('io').emit('product:updated', { id: product.id, stock: product.stock, price: product.price });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

module.exports = router;
