import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { inMemoryUsersMap } from '../server';

export const getUsers = async (req: Request, res: Response) => {
  try {
    let dbUsers: any[] = [];
    try {
      dbUsers = await prisma.user.findMany({
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      console.warn("DB findMany notice, using in-memory user list fallback");
    }

    // Merge in-memory verified users map with DB users
    const mergedMap = new Map<string, any>();

    // 1. Add memory users
    inMemoryUsersMap.forEach((u, email) => {
      mergedMap.set(email.toLowerCase(), u);
    });

    // 2. Add DB users (overwrite or enrich)
    dbUsers.forEach((u) => {
      const email = u.email.toLowerCase();
      const existing = mergedMap.get(email) || {};
      mergedMap.set(email, {
        ...existing,
        ...u,
        dateOfBirth: u.dateOfBirth || existing.dateOfBirth || 'N/A',
        professionalRole: u.professionalRole || existing.professionalRole || 'Freelancer',
        isVerified: u.isVerified !== false,
      });
    });

    const result = Array.from(mergedMap.values());
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
