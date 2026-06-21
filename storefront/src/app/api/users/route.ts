import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const dbPath = path.join(process.cwd(), "src/app/api/users/users.json");

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
    console.error("Users read error:", error);
    return [];
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Users write error:", error);
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
  const users = readDb();
  return corsResponse(users);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const users = readDb();
    
    // Check if user already exists
    const existingIndex = users.findIndex((u: any) => u.email === body.email);
    
    if (existingIndex >= 0) {
      // Update existing user (like a login event)
      users[existingIndex].lastLogin = new Date().toLocaleString();
      writeDb(users);
      return corsResponse({ message: "User updated", user: users[existingIndex] });
    } else {
      // New User
      const newUser = {
        id: body.uid || `USR-${Math.floor(Math.random() * 90000) + 10000}`,
        name: body.name || "Unknown User",
        email: body.email || "",
        status: "Active",
        purchases: 0,
        spent: "$0.00",
        createdAt: new Date().toLocaleString(),
        lastLogin: new Date().toLocaleString(),
      };
      users.unshift(newUser);
      writeDb(users);
      return corsResponse({ message: "User created", user: newUser });
    }
  } catch (error) {
    return corsResponse({ error: "Failed to process user" }, 500);
  }
}
