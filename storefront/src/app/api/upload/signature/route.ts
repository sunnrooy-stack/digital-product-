import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) {
    console.error("CLOUDINARY_API_SECRET is not configured");
    return NextResponse.json({ error: "Cloudinary API Secret missing" }, { status: 500 });
  }

  try {
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    return NextResponse.json({ timestamp, signature });
  } catch (error) {
    console.error("Cloudinary signature generation error:", error);
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}
