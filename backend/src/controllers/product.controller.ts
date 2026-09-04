import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Memory fallback products store initialized with real catalog products
export const inMemoryProductsStore: any[] = [];

// Auto-seed real catalog products if empty
const seedRealProducts = async () => {
  if (inMemoryProductsStore.length > 0) return;
  try {
    const res = await fetch("https://digital-product-1-l3qr.onrender.com/api/products").catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((p: any) => {
          if (!inMemoryProductsStore.some(item => String(item.id) === String(p.id))) {
            inMemoryProductsStore.push(p);
          }
        });
        console.log(`✅ Loaded ${inMemoryProductsStore.length} real products into backend product catalog.`);
      }
    }
  } catch (e) {}
};
seedRealOrdersAndProducts();

async function seedRealOrdersAndProducts() {
  await seedRealProducts();
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    let dbProducts: any[] = [];
    try {
      dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr) {
      console.warn("DB findMany products notice:", (dbErr as any).message);
    }

    const mergedMap = new Map<string, any>();
    const knownTitles = new Set<string>();

    // 1. Add DB products first
    dbProducts.forEach((p) => {
      mergedMap.set(String(p.id), {
        ...p,
        sellerName: p.sellerName || 'Admin',
      });
      if (p.title) {
        knownTitles.add(p.title.trim().toLowerCase());
      }
    });

    // 2. Add/Override memory store updates (latest updates take precedence, avoiding ghost duplicates)
    inMemoryProductsStore.forEach((p) => {
      if (p.id) {
        if (mergedMap.has(String(p.id))) {
          const existing = mergedMap.get(String(p.id)) || {};
          mergedMap.set(String(p.id), {
            ...existing,
            ...p,
            isFeatured: p.isFeatured !== undefined ? p.isFeatured : existing.isFeatured,
          });
        } else if (p.title && !knownTitles.has(p.title.trim().toLowerCase())) {
          // Only add memory-only product if it doesn't already exist in DB under the same title
          mergedMap.set(String(p.id), p);
          knownTitles.add(p.title.trim().toLowerCase());
        }
      }
    });

    let result = Array.from(mergedMap.values());
    if (result.length === 0 && inMemoryProductsStore.length === 0) {
      await seedRealProducts();
      result = inMemoryProductsStore;
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Fetch products error:', error);
    res.status(200).json(inMemoryProductsStore);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let product: any = null;
    try {
      product = await prisma.product.findUnique({
        where: { id },
        include: { reviews: true },
      });
    } catch (e) {}

    if (!product) {
      product = inMemoryProductsStore.find(p => String(p.id) === String(id));
    }

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, category, tags, coverImage, previewMedia, fileUrls, features, demoUrl, previewGallery, status, isFeatured, metaTitle, metaDescription, publishDate } = req.body;
    
    let sellerId = "admin_seller_id";
    try {
      const existingUser = await prisma.user.findFirst();
      if (existingUser) sellerId = existingUser.id;
    } catch (e) {}

    const productStatus = status === "Draft" ? "PENDING_APPROVAL" : "APPROVED";
    const isPublished = productStatus === "APPROVED";

    let dbProduct: any = null;
    try {
      const dbData: any = {
        title,
        description,
        price: parseFloat(price) || 0,
        category,
        tags: tags || [],
        coverImage: coverImage || "",
        previewMedia: previewMedia || [],
        fileUrls: fileUrls || [],
        features: features || [],
        demoUrl: demoUrl || "",
        previewGallery: previewGallery || [],
        status: productStatus,
        isPublished: isPublished,
        isFeatured: isFeatured !== undefined ? isFeatured : true,
        metaTitle: metaTitle || "",
        metaDescription: metaDescription || "",
        publishDate: publishDate ? new Date(publishDate) : null,
        sellerId: sellerId,
      };
      dbProduct = await prisma.product.create({
        data: dbData,
      });
    } catch (dbErr) {
      console.warn("Prisma create product notice (using memory fallback):", (dbErr as any).message);
    }

    const finalProduct = dbProduct ? {
      ...dbProduct,
      sellerName: "Admin",
    } : {
      id: req.body.id || ("prod_" + Date.now()),
      title,
      description,
      price: parseFloat(price) || 0,
      category,
      tags: tags || [],
      coverImage: coverImage || "",
      previewMedia: previewMedia || [],
      fileUrls: fileUrls || [],
      features: features || [],
      demoUrl: demoUrl || "",
      aspectRatio: req.body.aspectRatio || "16:9",
      previewGallery: previewGallery || [],
      status: productStatus,
      isPublished: isPublished,
      isFeatured: isFeatured !== undefined ? isFeatured : true,
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      sellerId: sellerId,
      sellerName: "Admin",
      createdAt: new Date(),
    };

    // Clean up temporary duplicates in memory store
    if (req.body.id) {
      const existingIdx = inMemoryProductsStore.findIndex(p => String(p.id) === String(req.body.id));
      if (existingIdx !== -1) inMemoryProductsStore.splice(existingIdx, 1);
    }
    const titleIdx = inMemoryProductsStore.findIndex(p => p.title && finalProduct.title && p.title.trim().toLowerCase() === finalProduct.title.trim().toLowerCase());
    if (titleIdx !== -1) inMemoryProductsStore.splice(titleIdx, 1);

    inMemoryProductsStore.unshift(finalProduct);

    res.status(201).json({ message: 'Product created successfully', product: finalProduct });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { id: _, sellerId, categoryRef, seller, publishDate, ...updateData } = req.body;

    let product: any = null;
    try {
      product = await prisma.product.update({
        where: { id },
        data: updateData,
      });
    } catch (e) {}

    // Update in memory store
    const memIndex = inMemoryProductsStore.findIndex(p => String(p.id) === String(id));
    if (memIndex !== -1) {
      inMemoryProductsStore[memIndex] = {
        ...inMemoryProductsStore[memIndex],
        ...updateData,
      };
    } else {
      inMemoryProductsStore.push({ id, ...updateData });
    }

    res.status(200).json({ message: 'Product updated successfully', product: product || updateData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    try {
      await prisma.product.delete({ where: { id } });
    } catch (e) {}

    const memIndex = inMemoryProductsStore.findIndex(p => String(p.id) === String(id));
    if (memIndex !== -1) {
      inMemoryProductsStore.splice(memIndex, 1);
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const fixFeaturedProducts = async (req: Request, res: Response) => {
  try {
    let count = 0;
    try {
      const result = await prisma.product.updateMany({
        data: { isFeatured: true },
      });
      count = result.count;
    } catch (e) {}

    inMemoryProductsStore.forEach(p => p.isFeatured = true);
    res.status(200).json({ message: 'Featured products fixed', count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fix featured products' });
  }
};
