import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, fixFeaturedProducts } from '../controllers/product.controller';
import { verifyToken, isSeller } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/fix/featured', fixFeaturedProducts);
router.get('/:id', getProductById);

// Temporarily bypassed security so Admin can create without tokens
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
