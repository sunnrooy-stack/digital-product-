import { Router } from 'express';
import { login, register, getProfile } from '../controllers/auth.controller';

import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);

export default router;
