import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const inMemoryOrdersStore: any[] = [];

// Seed existing production orders into memory store
const seedRealOrders = async () => {
  try {
    const res = await fetch("https://digital-product-1-l3qr.onrender.com/api/orders").catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((ord: any) => {
          const key = ord.id || ord.orderNumber || ord.paymentId;
          const exists = inMemoryOrdersStore.some(o => (o.id || o.orderNumber || o.paymentId) === key);
          if (!exists) {
            inMemoryOrdersStore.push(ord);
          }
        });
        console.log(`✅ Loaded ${inMemoryOrdersStore.length} unique real order records into backend order history.`);
      }
    }
  } catch (e) {}
};
seedRealOrders();

export const getOrders = async (req: Request, res: Response) => {
  try {
    let dbOrders: any[] = [];
    try {
      dbOrders = await prisma.order.findMany({
        include: {
          user: true,
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (dbErr) {
      console.warn("DB findMany orders notice:", (dbErr as any).message);
    }

    const mergedMap = new Map<string, any>();
    inMemoryOrdersStore.forEach((ord) => {
      const key = ord.id || ord.orderNumber || ord.paymentId;
      if (key) mergedMap.set(String(key), ord);
    });

    dbOrders.forEach((ord) => {
      const key = ord.id || ord.orderNumber || ord.paymentId;
      if (key) mergedMap.set(String(key), ord);
    });

    let result = Array.from(mergedMap.values());
    if (result.length === 0 && inMemoryOrdersStore.length === 0) {
      await seedRealOrders();
      result = Array.from(mergedMap.values());
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    res.status(200).json(inMemoryOrdersStore);
  }
};
