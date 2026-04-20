const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');
const { sendSms, orderConfirmedSms } = require('../services/sms.service');

const router = express.Router();
const prisma = new PrismaClient();

// Generate unique order number like ORD-20240112-ABC1
const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${date}-${random}`;
};

// POST /api/orders — place a new order
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, shippingCity, phone, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Fetch products to verify prices and stock
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    // Validate stock availability
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });
      }
    }

    // Calculate total using DB prices (never trust frontend prices)
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return { ...item, unitPrice: product.price, total: product.price * item.quantity };
    });
    const totalAmount = orderItems.reduce((sum, i) => sum + i.total, 0);

    // Create order and items in a transaction (all-or-nothing)
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: req.user.id,
          totalAmount,
          shippingAddress,
          shippingCity,
          phone,
          notes,
          items: {
            create: orderItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.total,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Decrement stock for each product
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // Emit real-time update to admin dashboard
    req.app.get('io').to('admin-room').emit('order:new', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.totalAmount,
      customerName: req.user.name,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// GET /api/orders — get logged-in user's orders
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: { include: { product: { select: { name: true, imageUrl: true } } } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id — get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: true } },
        payment: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

module.exports = router;
