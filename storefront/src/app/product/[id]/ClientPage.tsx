"use client";

import React, { useState, useEffect } from "react";
import { useCartStore, CartItem } from "@/store/cart";
import { useParams } from "next/navigation";
import ProductPreviewGallery from "@/components/ProductPreviewGallery";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { addItem, removeItem, isInCart } = useCartStore();
  const inCart = isInCart(id);

  const [product, setProduct] = useState<any>({
    id: id,
    title: "Loading Product...",
    price: 0,
    coverImage: "",
    sellerName: "Digital Vendor",
    description: "Please wait while product details are being loaded from catalog.",
    status: "Approved",
    isFeatured: true,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadProduct() {
      let data: any[] | null = null;
      try {
        const localRes = await fetch(`http://localhost:5000/api/products?t=${Date.now()}`).catch(() => null);
        if (localRes && localRes.ok) {
          data = await localRes.json().catch(() => null);
        }
      } catch (e) {}

      if (!data || !Array.isArray(data)) {
        try {
          const remoteRes = await fetch(`https://digital-product-1-l3qr.onrender.com/api/products?t=${Date.now()}`, { cache: "no-store" }).catch(() => null);
          if (remoteRes && remoteRes.ok) {
            data = await remoteRes.json().catch(() => null);
          }
        } catch (e) {}
      }

      if (isMounted) {
        if (Array.isArray(data)) {
          const match = data.find((p: any) => String(p.id) === String(id));
          if (match) {
            setProduct(match);
          } else {
            setProduct({
              id: id,
              title: "Digital Product Package",
              price: 49,
              coverImage: "",
              sellerName: "Digital Vendor",
              description: "Full digital assets package included.",
              status: "Approved",
              isFeatured: true,
            });
          }
        }
        setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const cartItem: CartItem = {
    id: String(product.id),
    title: product.title,
    price: Number(product.price),
    coverImage: product.coverImage || "",
    sellerName: product.sellerName || "Vendor",
    fileUrls: product.fileUrls || [],
  };

  return (
    <div className="py-20 px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Media */}
        <div className="space-y-4">
          <div className="aspect-video w-full rounded-2xl overflow-hidden relative group border border-border">
            {product.coverImage ? (
              <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-6xl">📦</span>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.isArray(product.previewMedia) && product.previewMedia.length > 0 ? (
              product.previewMedia.map((url: string, i: number) => (
                <div
                  key={i}
                  className="h-24 w-32 shrink-0 rounded-xl border border-border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                >
                  <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              [
                "from-indigo-500 to-purple-600",
                "from-pink-500 to-rose-600",
                "from-emerald-500 to-teal-600",
              ].map((gradient, i) => (
                <div
                  key={i}
                  className={`h-24 w-32 shrink-0 rounded-lg bg-gradient-to-br ${gradient} opacity-60 cursor-pointer hover:opacity-100 hover:ring-2 hover:ring-primary transition-all`}
                />
              ))
            )}
          </div>

          {/* Video Link Button Section - Only shown when Admin provides a valid Video Link / demoUrl */}
          {product.demoUrl && product.demoUrl.trim() !== "" && product.demoUrl !== "#" && (
            <div className="pt-2">
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:shadow-red-500/30 hover:scale-[1.01] transition-all border border-red-400/30 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">▶</span>
                  <span className="tracking-wide uppercase font-black">VIDEO LINK</span>
                </div>
                <span className="text-xs bg-white/20 group-hover:bg-white/30 px-3 py-1 rounded-lg font-mono flex items-center gap-1 transition-colors">
                  <span>{product.demoUrl.replace(/^https?:\/\//, '').split('/')[0]}</span>
                  <span>↗</span>
                </span>
              </a>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            {product.title}
          </h1>
          <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="text-yellow-500">★★★★★</span>
              <span>4.9 (128 reviews)</span>
            </span>
            <span>•</span>
            <span>By {product.sellerName || "Admin"}</span>
          </div>

          <div className="text-3xl font-bold text-primary mb-6">
            ₹{Number(product.price).toFixed(2)}
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="flex flex-col gap-4 mt-auto">
            <button
              onClick={() =>
                inCart ? removeItem(cartItem.id) : addItem(cartItem)
              }
              className={`w-full rounded-full py-4 text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] ${
                inCart
                  ? "bg-primary/20 text-primary border-2 border-primary/30"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {inCart ? "Remove from Cart ✓" : "Add to Cart"}
            </button>
            <button className="w-full rounded-full bg-muted/50 py-4 text-lg font-bold hover:bg-muted transition-colors flex items-center justify-center gap-2 border border-border">
              Add to Wishlist ❤️
            </button>
          </div>

          <div className="mt-8 border-t border-border pt-8">
            <h3 className="font-bold mb-4">What&apos;s included:</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Full source code download</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Figma design templates (if specified)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Comprehensive setup documentation</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>Lifetime updates</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
