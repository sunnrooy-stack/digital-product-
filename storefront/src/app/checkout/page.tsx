"use client";

import React, { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";

export default function CheckoutPage() {
  const { items, removeItem, totalAmount, clearCart } = useCartStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!email) {
      alert("Please enter your email address to proceed with the checkout!");
      return;
    }

    setLoading(true);

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    try {
      let orderId = undefined;
      try {
        // Create Order on the backend
        const res = await fetch("https://digital-product-1-l3qr.onrender.com/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount() }),
        });
        const data = await res.json();

        if (res.ok) {
          orderId = data.orderId;
        } else {
          alert(`Razorpay API Error: ${data.error}. Please check your keys or account status.`);
          setLoading(false);
          return;
        }
      } catch (e: any) {
        alert("Could not reach backend API for order creation: " + e.message);
        setLoading(false);
        return;
      }

      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const options: any = {
        key: key,
        amount: Math.round(totalAmount() * 100), // Amount in paise
        currency: "INR",
        name: "Digital Products Store",
        description: "Digital Products Purchase",
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("https://digital-product-1-l3qr.onrender.com/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Create the order in our database
              try {
                await fetch("https://digital-product-1-l3qr.onrender.com/api/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    paymentId: response.razorpay_payment_id,
                    customer: email.split("@")[0] || "Guest",
                    email: email,
                    amount: `₹${totalAmount().toFixed(2)}`,
                    product: items.length === 1 ? items[0].title : `${items.length} Products`,
                    items: items,
                    status: "Completed"
                  })
                });
              } catch (e) {
                console.error("Failed to save order to db", e);
              }

              // Save purchased items to localStorage so the success page can display downloads
              localStorage.setItem("recent_purchase", JSON.stringify({
                payment_id: response.razorpay_payment_id,
                items: items
              }));
              
              clearCart();
              window.location.href = `/success?payment_id=${response.razorpay_payment_id}`;
            } else {
              alert("Payment verification failed! Please contact support.");
              setLoading(false);
            }
          } catch (err) {
            console.error("Verification error", err);
            alert("Payment verification encountered an error. Please check your dashboard.");
            setLoading(false);
          }
        },
        prefill: {
          email: email,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      if (orderId) {
        options.order_id = orderId;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay trigger error:", err);
      alert(err.message || "Could not load Razorpay payment modal. Verify your key config.");
      setLoading(false);
    }
  };

  return (
    <div className="py-20 px-6 lg:px-8 max-w-5xl mx-auto w-full min-h-screen">
      <h1 className="text-4xl font-extrabold tracking-tight mb-10">Checkout</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🛒</span>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven&apos;t added any products yet.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            <section className="glass-panel p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </section>

            <section className="glass-panel p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-4">
                <div className="border border-primary bg-primary/5 rounded-xl p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      defaultChecked
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="font-semibold">
                      Razorpay (Cards, UPI, NetBanking)
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">Live Key Configured</span>
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-8 rounded-2xl sticky top-24 border border-primary/20 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                      <span className="text-white text-xl">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        by {item.sellerName}
                      </p>
                      <p className="font-bold mt-1">₹{item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors self-start"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-border mt-3">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{totalAmount().toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full rounded-xl bg-primary py-4 text-base font-bold text-white shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? "Processing..." : "Pay Now"}
              </button>
              <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                🔒 Secure encrypted checkout
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
