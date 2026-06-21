import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { verifyToken, isSeller } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected Seller routes
router.post('/', verifyToken, isSeller, createProduct);
router.put('/:id', verifyToken, isSeller, updateProduct);
router.delete('/:id', verifyToken, isSeller, deleteProduct);

export default router;
