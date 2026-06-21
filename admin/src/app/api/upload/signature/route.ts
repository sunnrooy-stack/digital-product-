import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  try {
    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      process.env.CLOUDINARY_API_SECRET as string
    );
    
    return NextResponse.json({ timestamp, signature });
  } catch (error) {
    console.error("Cloudinary signature generation error:", error);
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}
