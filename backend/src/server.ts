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
