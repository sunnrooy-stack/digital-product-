import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { productIds } = req.body;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Calculate total amount
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Some products not found' });
    }

    const totalAmount = products.reduce((sum, p) => sum + p.price, 0);

    // Create Razorpay order
    const options = {
      amount: Math.round(totalAmount * 100), // amount in smallest currency unit
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save order in database
    const dbOrder = await prisma.order.create({
      data: {
        orderNumber: razorpayOrder.id,
        totalAmount,
        userId: req.user.id,
        items: {
          create: products.map(p => ({
            priceAtPurchase: p.price,
            productId: p.id,
          })),
        },
      },
    });

    res.status(200).json({
      order: dbOrder,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update order status
    await prisma.order.update({
      where: { orderNumber: razorpayOrderId },
      data: {
        status: 'COMPLETED',
        paymentId: razorpayPaymentId,
      },
    });

    res.status(200).json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};
