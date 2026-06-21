import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true, status: 'APPROVED' },
      include: { seller: { select: { name: true, avatar: true } } },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: { select: { name: true, avatar: true } }, reviews: true },
    });
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, category, tags, coverImage, previewMedia, fileUrls } = req.body;
    
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        tags: tags || [],
        coverImage,
        previewMedia: previewMedia || [],
        fileUrls: fileUrls || [],
        sellerId: req.user.id,
      },
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Verify ownership
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.sellerId !== req.user.id) return res.status(403).json({ error: 'Forbidden: You do not own this product' });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: You do not have permission' });
    }

    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
