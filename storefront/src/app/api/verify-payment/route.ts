import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!key_secret) {
      return NextResponse.json({ success: false, message: "Missing Razorpay secret key in backend" }, { status: 500 });
    }

    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment Verified
      return NextResponse.json({ success: true, message: "Payment Verified" });
    } else {
      return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
