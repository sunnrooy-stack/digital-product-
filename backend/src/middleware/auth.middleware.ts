import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import prisma from '../config/prisma';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const user = await prisma.user.findUnique({ where: { firebaseUid: decodedToken.uid } });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found in database' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const isSeller = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'SELLER') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Seller access required' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};
