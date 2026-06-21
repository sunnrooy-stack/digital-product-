import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/create-order', verifyToken, createOrder);
router.post('/verify-payment', verifyToken, verifyPayment);

export default router;
