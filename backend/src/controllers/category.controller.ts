import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subCategories: true }
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, parentId, metaTitle, metaDescription } = req.body;
    const category = await prisma.category.create({
      data: { name, slug, parentId, metaTitle, metaDescription }
    });
    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id, name, slug, parentId, metaTitle, metaDescription } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, parentId, metaTitle, metaDescription }
    });
    res.status(200).json({ message: 'Category updated', category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    await prisma.category.delete({
      where: { id: String(id) }
    });
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
