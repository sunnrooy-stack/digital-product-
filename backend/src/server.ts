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

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Premium Digital Product Store API is running');
});

app.listen(port, async () => {
  await connectRedis();
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
