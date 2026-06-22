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

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, category, tags, coverImage, previewMedia, fileUrls, status, isFeatured, metaTitle, metaDescription, publishDate } = req.body;
    
    // Create or find a dummy admin user if none exists
    let sellerId = "dummy_admin_id";
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      sellerId = existingUser.id;
    } else {
      const newUser = await prisma.user.create({
        data: {
          firebaseUid: "dummy_admin_uid_" + Date.now(),
          email: "admin@example.com",
          name: "Admin",
          role: "ADMIN"
        }
      });
      sellerId = newUser.id;
    }

    const productStatus = status === "Draft" ? "PENDING_APPROVAL" : "APPROVED";
    const isPublished = productStatus === "APPROVED";

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        tags: tags || [],
        coverImage: coverImage || "",
        previewMedia: previewMedia || [],
        fileUrls: fileUrls || [],
        status: productStatus,
        isPublished: isPublished,
        isFeatured: isFeatured !== undefined ? isFeatured : true,
        metaTitle: metaTitle || "",
        metaDescription: metaDescription || "",
        publishDate: publishDate ? new Date(publishDate) : null,
        sellerId: sellerId,
      },
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { id: _, sellerId, categoryRef, seller, publishDate, ...updateData } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const dataToUpdate: any = { ...updateData };
    if (publishDate) {
      dataToUpdate.publishDate = new Date(publishDate);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const fixFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const result = await prisma.product.updateMany({
      data: { isFeatured: true },
    });
    res.status(200).json({ message: 'Featured products fixed', count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fix featured products' });
  }
};
