import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';

const router = Router();

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/', updateCategory);
router.delete('/', deleteCategory);

export default router;
