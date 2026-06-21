import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    const key_id = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "").trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "Razorpay keys are missing from environment variables (.env.local)" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    console.log("Using Razorpay Key ID:", key_id);
    console.log("Using Razorpay Secret starting with:", key_secret.substring(0, 5) + "...");

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ orderId: order.id });
  } catch (error: any) {
    console.error("Error creating order:", error);
    const errorMsg = error?.error?.description || error.message || "Failed to create order";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
