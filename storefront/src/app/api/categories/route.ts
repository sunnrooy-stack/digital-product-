import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const dbPath = path.join(process.cwd(), "src/app/api/categories/categories.json");

function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      const initialData = [
        { id: "1", name: "Design Templates", slug: "design-templates", parentId: null, metaTitle: "Premium Design Templates", metaDescription: "Download the best design templates, Figma kits, and UI icons." },
        { id: "2", name: "Figma Kits", slug: "figma-kits", parentId: "1", metaTitle: "Professional Figma Kits", metaDescription: "Ready-to-use Figma kits for mobile and web apps." },
        { id: "3", name: "Web Development", slug: "web-development", parentId: null, metaTitle: "Code & Web Development boilerplates", metaDescription: "Modern React and Next.js boilerplates to speed up development." },
        { id: "4", name: "Audio & Beats", slug: "audio-beats", parentId: null, metaTitle: "Music & Beats Sound Kits", metaDescription: "Royalty-free music loops and sample packs." },
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

function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Database write error:", error);
  }
}

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

export async function OPTIONS() {
  return corsResponse({}, 200);
}

export async function GET() {
  const categories = readDb();
  return corsResponse(categories);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const categories = readDb();
    
    const newCategory = {
      id: body.id || Date.now().toString(),
      name: body.name || "Untitled",
      slug: body.slug || "untitled",
      parentId: body.parentId || null,
      metaTitle: body.metaTitle || "",
      metaDescription: body.metaDescription || "",
    };
    
    categories.push(newCategory);
    writeDb(categories);
    
    return corsResponse({ message: "Category created", category: newCategory });
  } catch (error) {
    return corsResponse({ error: "Failed to create category" }, 500);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return corsResponse({ error: "ID required" }, 400);
    
    let categories = readDb();
    let updated = null;
    
    categories = categories.map((c: any) => {
      if (c.id === id) {
        updated = { ...c, ...body };
        return updated;
      }
      return c;
    });
    
    writeDb(categories);
    return corsResponse({ message: "Category updated", category: updated });
  } catch (error) {
    return corsResponse({ error: "Failed to update category" }, 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return corsResponse({ error: "ID required" }, 400);
    
    let categories = readDb();
    categories = categories.filter((c: any) => c.id !== id);
    writeDb(categories);
    
    return corsResponse({ message: "Category deleted" });
  } catch (error) {
    return corsResponse({ error: "Failed to delete category" }, 500);
  }
}
