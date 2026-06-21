import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// A local JSON file inside the workspace to persist products across app runs
const dbPath = path.join(process.cwd(), "src/app/api/products/products.json");

// Helper to read products
function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      // Initialize with default mock data
      const initialData = [
        { id: "1", title: "SaaS Starter Kit", price: 89, description: "A premium SaaS boilerplate with authentication and Stripe integrations.", category: "Templates", tags: ["nextjs", "saas", "stripe"], coverImage: "", sellerName: "DevPro", status: "Approved", isFeatured: true, downloads: 120, views: 500, revenue: 10680 },
        { id: "2", title: "AI Prompt Pack", price: 29, description: "Highly engineered AI prompts for marketing and automation.", category: "AI Prompts", tags: ["gpt", "prompts", "ai"], coverImage: "", sellerName: "PromptMaster", status: "Approved", isFeatured: true, downloads: 300, views: 980, revenue: 8700 },
        { id: "3", title: "React Dashboard", price: 49, description: "Beautiful custom React admin dashboard dashboard components.", category: "Templates", tags: ["react", "ui", "tailwind"], coverImage: "", sellerName: "UIForge", status: "Approved", isFeatured: true, downloads: 85, views: 320, revenue: 4165 },
        { id: "4", title: "E-book: Design Systems", price: 19, description: "Step by step guide to build and scale your corporate design system.", category: "E-books", tags: ["design", "systems", "figma"], coverImage: "", sellerName: "DesignGuru", status: "Approved", isFeatured: true, downloads: 50, views: 180, revenue: 950 },
      ];
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Database read error:", error);
    return [];
  }
}

// Helper to write products
function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Database write error:", error);
  }
}

// CORS Headers helper
function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return corsResponse({}, 200);
}

export async function GET() {
  const products = readDb();
  return corsResponse(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const products = readDb();
    
    const newProduct = {
      id: body.id || Date.now().toString(),
      title: body.title || "Untitled Product",
      price: Number(body.price) || 0,
      description: body.description || "",
      category: body.category || "General",
      tags: body.tags || [],
      coverImage: body.coverImage || "",
      sellerName: body.sellerName || "Admin",
      status: body.status || "Approved",
      isFeatured: body.isFeatured !== undefined ? body.isFeatured : true,
      downloads: body.downloads || 0,
      views: body.views || 0,
      revenue: body.revenue || 0,
      fileUrls: body.fileUrls || [],
    };
    
    products.push(newProduct);
    writeDb(products);
    
    return corsResponse({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    return corsResponse({ error: "Failed to create product" }, 500);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return corsResponse({ error: "Product ID required" }, 400);
    
    let products = readDb();
    let updatedProduct = null;
    
    products = products.map((p: any) => {
      if (p.id === id) {
        updatedProduct = { ...p, ...body };
        return updatedProduct;
      }
      return p;
    });
    
    writeDb(products);
    return corsResponse({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    return corsResponse({ error: "Failed to update product" }, 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return corsResponse({ error: "Product ID required" }, 400);
    
    let products = readDb();
    products = products.filter((p: any) => p.id !== id);
    writeDb(products);
    
    return corsResponse({ message: "Product deleted successfully" });
  } catch (error) {
    return corsResponse({ error: "Failed to delete product" }, 500);
  }
}
