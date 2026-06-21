import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const dbPath = path.join(process.cwd(), "src/app/api/orders/orders.json");

function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Orders read error:", error);
    return [];
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Orders write error:", error);
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
  const orders = readDb();
  return corsResponse(orders);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orders = readDb();
    
    const newOrder = {
      id: body.id || `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
      customer: body.customer || "Unknown",
      email: body.email || "",
      product: body.product || "Multiple Products",
      amount: body.amount || "$0.00",
      date: new Date().toLocaleString(),
      status: body.status || "Completed",
      items: body.items || [],
      paymentId: body.paymentId || ""
    };
    
    orders.unshift(newOrder); // Add to beginning
    writeDb(orders);
    
    return corsResponse({ message: "Order created", order: newOrder });
  } catch (error) {
    return corsResponse({ error: "Failed to create order" }, 500);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) return corsResponse({ error: "ID and status required" }, 400);
    
    let orders = readDb();
    let updated = null;
    
    orders = orders.map((o: any) => {
      if (o.id === id) {
        updated = { ...o, status };
        return updated;
      }
      return o;
    });
    
    writeDb(orders);
    return corsResponse({ message: "Order updated", order: updated });
  } catch (error) {
    return corsResponse({ error: "Failed to update order" }, 500);
  }
}
