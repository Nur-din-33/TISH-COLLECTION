const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const [totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders, ordersByStatus] = await Promise.all([
      prisma.order.count(),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } }, payment: true },
      }),
      prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    res.json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalProducts,
        totalUsers,
        recentOrders,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user:    { select: { name: true, email: true, phone: true } },
          items:   { include: { product: { select: { name: true } } } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip:    (parseInt(page) - 1) * parseInt(limit),
        take:    parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, orders, total, page: parseInt(page) });
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data:  { status },
      include: { user: true },
    });
    req.app.get('io')?.emit('order:statusUpdated', { orderId: order.id, status });
    res.json({ success: true, order });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, products });
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data:  { active: false },
    });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// GET /api/admin/suppliers — get all suppliers (safe version)
router.get('/suppliers', async (req, res) => {
  try {
    // Try with active filter first
    let suppliers = [];
    try {
      suppliers = await prisma.supplier.findMany({
        where: { active: true },
        select: { id: true, name: true, email: true, country: true },
        orderBy: { name: 'asc' },
      });
    } catch {
      // If active column doesn't exist yet, get all suppliers
      suppliers = await prisma.supplier.findMany({
        select: { id: true, name: true, email: true, country: true },
        orderBy: { name: 'asc' },
      });
    }
    res.json({ success: true, suppliers });
  } catch (error) {
    console.error('Suppliers error:', error);
    // Return empty array instead of 500 — page still works without suppliers
    res.json({ success: true, suppliers: [] });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where:   { role: 'CUSTOMER' },
      select:  { id: true, name: true, email: true, phone: true, createdAt: true, isVerified: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

module.exports = router;
