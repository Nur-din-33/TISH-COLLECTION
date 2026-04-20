const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/analytics — dashboard stats
router.get('/analytics', async (req, res) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
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
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// GET /api/admin/orders — all orders with pagination
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: { include: { product: { select: { name: true } } } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, orders, total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// PATCH /api/admin/orders/:id/status — update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { user: true },
    });

    // Notify all connected clients of the status change
    req.app.get('io').emit('order:statusUpdated', { orderId: order.id, status });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// GET /api/admin/products — all products including inactive
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, supplier: true, _count: { select: { orderItems: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// DELETE /api/admin/products/:id — soft delete (set active=false)
router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

module.exports = router;
