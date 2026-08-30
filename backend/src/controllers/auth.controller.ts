import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import admin from '../config/firebase';

export const register = async (req: Request, res: Response) => {
  try {
    const { token, name, role } = req.body;
    if (!token) return res.status(400).json({ error: 'Firebase token is required' });

    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    if (!email) return res.status(400).json({ error: 'Email not found in token' });

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    user = await prisma.user.create({
      data: {
        firebaseUid: uid,
        email,
        name: name || email.split('@')[0],
        role: role === 'SELLER' ? 'SELLER' : 'USER',
      },
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error: any) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Firebase token is required' });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    const user = await prisma.user.findUnique({ where: { firebaseUid: uid } });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    res.status(200).json({ message: 'User logged in successfully', user });
  } catch (error: any) {
    console.error('Login Error:', error.message);
    res.status(500).json({ error: 'Failed to login user' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ profile: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
