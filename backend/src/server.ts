import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectRedis } from './config/redis';
import './config/firebase'; // Initialize Firebase
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import paymentRoutes from './routes/payment.routes';
import categoryRoutes from './routes/category.routes';
import userRoutes from './routes/user.routes';
import orderRoutes from './routes/order.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'https://digitals-product-store.onrender.com', 
    'https://digital-product-2.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from './config/prisma';

// Guest Checkout Routes
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (err) {
    console.error('Razorpay Create Order Error:', err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (generatedSignature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (err) {
    console.error('Razorpay Verify Error:', err);
    res.status(500).json({ success: false });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { paymentId, customer, email, amount, items, status } = req.body;
    
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: customer || 'Guest',
          firebaseUid: 'guest_' + Date.now() + Math.random().toString(36).substr(2, 9),
        }
      });
    }

    let totalAmount = 0;
    if (typeof amount === 'string') {
      totalAmount = parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0;
    } else {
      totalAmount = Number(amount) || 0;
    }

    const dbOrder = await prisma.order.create({
      data: {
        orderNumber: paymentId || `ord_${Date.now()}`,
        totalAmount,
        status: status === 'Completed' ? 'COMPLETED' : 'PENDING',
        paymentId,
        userId: user.id,
        items: {
          create: items.map((item: any) => ({
            priceAtPurchase: item.price,
            productId: item.id,
          }))
        }
      }
    });

    res.json({ success: true, order: dbOrder });
  } catch (err) {
    console.error('Save Order Error:', err);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Premium Digital Product Store API is running');
});

app.listen(port, async () => {
  await connectRedis();
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
