"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  const [purchaseData, setPurchaseData] = useState<any>(null);

  useEffect(() => {
    // Retrieve the purchased items saved just before the redirect
    const saved = localStorage.getItem("recent_purchase");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.payment_id === paymentId) {
          // Fetch latest product data to guarantee we have the fileUrls,
          // even if the cart item was cached before we added fileUrls support.
          fetch("/api/products")
            .then((res) => res.json())
            .then((products) => {
              const enrichedItems = parsed.items.map((cartItem: any) => {
                const dbProduct = products.find((p: any) => p.id === cartItem.id);
                if (dbProduct && dbProduct.fileUrls && dbProduct.fileUrls.length > 0) {
                  return { ...cartItem, fileUrls: dbProduct.fileUrls };
                }
                return cartItem;
              });
              setPurchaseData({ ...parsed, items: enrichedItems });
            })
            .catch(() => {
              // Fallback to exactly what was in the cart
              setPurchaseData(parsed);
            });
        }
      } catch (e) {
        console.error("Could not parse recent purchase", e);
      }
    }
  }, [paymentId]);

  const getDownloadUrl = (url: string) => {
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return url;
  };

  return (
    <div className="py-20 px-6 lg:px-8 max-w-4xl mx-auto min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-8 border-4 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-center">Payment Successful!</h1>
      <p className="text-muted-foreground text-lg text-center max-w-xl mb-12">
        Thank you for your purchase. Your payment (<strong>{paymentId}</strong>) was successfully verified. Your digital products are now ready for download.
      </p>

      {purchaseData && purchaseData.items && purchaseData.items.length > 0 ? (
        <div className="w-full glass-panel p-8 rounded-3xl mb-10">
          <h2 className="text-2xl font-bold mb-6">Your Downloads</h2>
          <div className="space-y-4">
            {purchaseData.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    📦
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">by {item.sellerName}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {item.fileUrls && item.fileUrls.length > 0 ? (
                    item.fileUrls.map((url: string, index: number) => (
                      <a
                        key={index}
                        href={getDownloadUrl(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold rounded-lg transition-all flex items-center gap-2 text-sm justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download File {item.fileUrls.length > 1 ? index + 1 : ''}
                      </a>
                    ))
                  ) : (
                    <a
                      href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold rounded-lg transition-all flex items-center gap-2 text-sm justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download (Demo)
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full glass-panel p-8 rounded-3xl mb-10 text-center">
          <p className="text-muted-foreground">Loading your download links...</p>
        </div>
      )}

      <div className="flex gap-4">
        <Link href="/dashboard?tab=purchases" className="px-6 py-3 rounded-full font-semibold border border-border hover:bg-primary/5 transition-colors">
          View Receipt
        </Link>
        <Link href="/products" className="px-6 py-3 rounded-full font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
