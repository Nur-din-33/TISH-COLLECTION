const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');
const { initiateStkPush, queryStkStatus } = require('../services/mpesa.service');
const { sendSms } = require('../services/sms.service');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/payments/mpesa/initiate — trigger STK Push to customer's phone
router.post('/mpesa/initiate', authenticate, async (req, res) => {
  try {
    const { orderId, phone } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your order' });
    }

    // Call Safaricom Daraja API to send payment request to phone
    const stkResponse = await initiateStkPush({
      phone: phone || order.phone,
      amount: order.totalAmount,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });

    if (stkResponse.ResponseCode !== '0') {
      return res.status(400).json({ success: false, message: 'M-Pesa request failed', details: stkResponse });
    }

    // Save pending payment record
    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        method: 'MPESA',
        status: 'PENDING',
        amount: order.totalAmount,
        phoneNumber: phone || order.phone,
        mpesaCode: stkResponse.CheckoutRequestID,
      },
      update: {
        mpesaCode: stkResponse.CheckoutRequestID,
        status: 'PENDING',
      },
    });

    res.json({
      success: true,
      message: 'M-Pesa payment request sent to your phone. Enter your PIN to complete.',
      checkoutRequestId: stkResponse.CheckoutRequestID,
    });
  } catch (error) {
    console.error('M-Pesa initiate error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Payment initiation failed. Check your .env M-Pesa credentials.' });
  }
});

// POST /api/payments/mpesa/callback — Safaricom calls this URL after payment
// IMPORTANT: This URL must be publicly accessible (use ngrok locally)
router.post('/mpesa/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const callbackData = Body.stkCallback;

    // ResultCode 0 = success
    if (callbackData.ResultCode === 0) {
      const metadata = callbackData.CallbackMetadata.Item;
      const amount = metadata.find((i) => i.Name === 'Amount')?.Value;
      const receiptNumber = metadata.find((i) => i.Name === 'MpesaReceiptNumber')?.Value;
      const phone = metadata.find((i) => i.Name === 'PhoneNumber')?.Value;

      // Update payment status
      const payment = await prisma.payment.update({
        where: { mpesaCode: callbackData.CheckoutRequestID },
        data: {
          status: 'COMPLETED',
          mpesaReceiptNumber: receiptNumber,
          phoneNumber: String(phone),
        },
        include: { order: { include: { user: true } } },
      });

      // Update order status to confirmed
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      });

      // Notify admin dashboard in real-time via Socket.io
      // (io is available globally via app — in production use a proper event bus)
      console.log(`✅ Payment received: ${receiptNumber} for order ${payment.order.orderNumber}`);

      // Send SMS confirmation to customer
      try {
        await sendSms({
          to: `+${phone}`,
          message: `Payment confirmed! KES ${amount} received. Order #${payment.order.orderNumber} is being processed. Receipt: ${receiptNumber}`,
        });
      } catch (smsError) {
        console.error('SMS send failed:', smsError.message);
      }
    } else {
      // Payment failed or was cancelled
      await prisma.payment.updateMany({
        where: { mpesaCode: callbackData.CheckoutRequestID },
        data: { status: 'FAILED' },
      });
      console.log(`❌ Payment failed: ${callbackData.ResultDesc}`);
    }

    // Always respond 200 to Safaricom or they will retry
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// GET /api/payments/mpesa/status/:checkoutRequestId — poll payment status
router.get('/mpesa/status/:checkoutRequestId', authenticate, async (req, res) => {
  try {
    const status = await queryStkStatus(req.params.checkoutRequestId);
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Status check failed' });
  }
});

module.exports = router;
