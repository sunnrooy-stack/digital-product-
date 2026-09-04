"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useCartStore, CartItem } from "@/store/cart";
import { useSearchParams } from "next/navigation";

import AuthVerificationModal from "@/components/AuthVerificationModal";

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"free" | "cart" | null>(null);

  // 5-Second Confirmation state
  const [confirmingAction, setConfirmingAction] = useState<"free" | "cart" | null>(null);
  const [countdown, setCountdown] = useState<number>(5);

  const { addItem, removeItem, isInCart } = useCartStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  const checkUserVerified = () => {
    try {
      const stored = localStorage.getItem("verified_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isVerified) return true;
      }
    } catch (e) {}
    return false;
  };

  const executeAction = (actionType: "free" | "cart") => {
    if (!product) return;
    const cartItem: CartItem = {
      id: String(product.id),
      title: product.title,
      price: Number(product.price),
      coverImage: product.coverImage || "",
      sellerName: product.sellerName || "Vendor",
      fileUrls: product.fileUrls || [],
    };

    if (actionType === "free") {
      const freePaymentId = `FREE_${Date.now()}`;
      localStorage.setItem("recent_purchase", JSON.stringify({
        payment_id: freePaymentId,
        items: [cartItem]
      }));
      window.location.href = `/success?payment_id=${freePaymentId}`;
    } else {
      const inCart = isInCart(String(product.id));
      if (inCart) {
        removeItem(String(product.id));
      } else {
        addItem(cartItem);
      }
    }
  };

  const handleProductAction = (actionType: "free" | "cart") => {
    if (!checkUserVerified()) {
      setPendingAction(actionType);
      setIsAuthModalOpen(true);
      return;
    }
    // Start 5-second countdown confirmation
    setPendingAction(actionType);
    setCountdown(5);
    setConfirmingAction(actionType);
  };

  const handleVerifiedSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingAction) {
      setCountdown(5);
      setConfirmingAction(pendingAction);
    }
  };

  // 5-second Timer Effect
  useEffect(() => {
    if (!confirmingAction) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      executeAction(confirmingAction);
      setConfirmingAction(null);
    }
  }, [confirmingAction, countdown]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;

    async function loadProduct() {
      setLoading(true);
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

      let localProducts: any[] = [];
      try {
        const stored = localStorage.getItem("admin_local_products");
        if (stored) localProducts = JSON.parse(stored);
      } catch (e) {}

      if (isMounted) {
        if (Array.isArray(data)) {
          const map = new Map<string, any>();
          const titleMap = new Map<string, string>();

          data.forEach(p => {
            map.set(String(p.id), p);
            if (p.title) titleMap.set(p.title.trim().toLowerCase(), String(p.id));
          });

          localProducts.forEach(p => {
            const titleKey = p.title ? p.title.trim().toLowerCase() : "";
            if (map.has(String(p.id))) {
              map.set(String(p.id), { ...map.get(String(p.id)), ...p });
            } else if (titleKey && titleMap.has(titleKey)) {
              const dbId = titleMap.get(titleKey)!;
              map.set(dbId, { ...map.get(dbId), ...p, id: dbId });
            } else {
              map.set(String(p.id), p);
            }
          });
          
          const match = map.get(String(id)) || (id ? Array.from(map.values()).find(p => String(p.id) === String(id) || (p.title && String(id).toLowerCase().includes(p.title.toLowerCase()))) : null);
          if (match) {
            setProduct(match);
            setActiveImage(match.coverImage || "");
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
        } else if (localProducts.length > 0) {
          const match = localProducts.find((p: any) => String(p.id) === String(id));
          if (match) {
            setProduct(match);
            setActiveImage(match.coverImage || "");
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

  if (!id) {
    return (
      <div className="py-20 px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">No product ID specified.</h1>
      </div>
    );
  }

  // Render Full API Loading Skeleton
  if (loading || !product) {
    return (
      <div className="py-20 px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-indigo-400 text-sm font-bold tracking-wide uppercase">Fetching product details from API...</span>
            </div>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 w-28 rounded-xl bg-slate-800/80"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-6 w-28 bg-slate-800 rounded-full"></div>
            <div className="h-10 w-3/4 bg-slate-800 rounded-xl"></div>
            <div className="h-6 w-1/3 bg-slate-800 rounded-lg"></div>
            <div className="h-24 w-full bg-slate-800/60 rounded-2xl"></div>
            <div className="h-14 w-full bg-slate-800 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages: string[] = Array.from(new Set([
    product.coverImage,
    ...(product.previewMedia || [])
  ])).filter(Boolean);

  const displayedMainImage = activeImage || product.coverImage;

  const getImageAspectRatio = (index: number) => {
    if (product.aspectRatios && product.aspectRatios[index]) return product.aspectRatios[index];
    if (index === 0) return product.coverAspectRatio || product.aspectRatio || "16:9";
    if (index === 1) return product.preview1AspectRatio || "16:9";
    if (index === 2) return product.preview2AspectRatio || "16:9";
    if (index === 3) return product.preview3AspectRatio || "16:9";
    return product.aspectRatio || "16:9";
  };

  const activeIndex = Math.max(0, galleryImages.findIndex((img) => img === displayedMainImage));
  const currentActiveRatio = getImageAspectRatio(activeIndex);

  const getAspectRatioClass = (ratio?: string) => {
    const r = String(ratio || "").trim();
    if (r === "1:1" || r === "1/1") return "aspect-square max-h-[500px]";
    if (r === "9:16" || r === "9/16") return "aspect-[9/16] max-h-[600px]";
    if (r === "4:3" || r === "4/3") return "aspect-[4/3] max-h-[520px]";
    return "aspect-video"; // default 16:9
  };

  const getThumbnailSizeClass = (ratio?: string) => {
    const r = String(ratio || "").trim();
    if (r === "9:16" || r === "9/16") return "h-28 w-20 aspect-[9/16]";
    if (r === "1:1" || r === "1/1") return "h-20 w-20 aspect-square";
    if (r === "4:3" || r === "4/3") return "h-20 w-24 aspect-[4/3]";
    return "h-20 w-28 aspect-video"; // default 16:9
  };

  return (
    <div className="py-20 px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Media */}
        <div className="space-y-4">
          {/* Main Large Preview Banner */}
          <div className={`w-full rounded-2xl overflow-hidden relative group border border-border bg-slate-900 flex items-center justify-center shadow-xl transition-all duration-300 ${getAspectRatioClass(currentActiveRatio)}`}>
            {displayedMainImage ? (
              <img src={displayedMainImage} alt={product.title} className="w-full h-full object-cover transition-all duration-300" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-6xl">📦</span>
                </div>
              </>
            )}

            {/* Resolution / Aspect Ratio Badge */}
            <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-indigo-300 text-[10px] font-mono font-black px-2.5 py-1 rounded-lg border border-indigo-500/30 shadow-lg flex items-center gap-1">
              <span>📐</span>
              <span>{currentActiveRatio}</span>
            </span>
          </div>

          {/* Interactive Thumbnails Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Product Preview Gallery:</p>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Active Ratio: {currentActiveRatio}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.length > 0 ? (
                galleryImages.map((imgUrl, i) => {
                  const isSelected = displayedMainImage === imgUrl;
                  const itemRatio = getImageAspectRatio(i);
                  return (
                    <div
                      key={i}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all border-2 relative group ${getThumbnailSizeClass(itemRatio)} ${
                        isSelected
                          ? "border-primary ring-4 ring-primary/20 scale-105"
                          : "border-border/70 opacity-70 hover:opacity-100 hover:border-primary/50"
                      }`}
                    >
                      <img src={imgUrl} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                        {itemRatio}
                      </span>
                    </div>
                  );
                })
              ) : (
                ["from-indigo-500 to-purple-600", "from-pink-500 to-rose-600", "from-emerald-500 to-teal-600"].map((gradient, i) => (
                  <div
                    key={i}
                    className={`shrink-0 rounded-xl bg-gradient-to-br ${gradient} opacity-60 flex items-center justify-center text-white text-xs font-bold ${getThumbnailSizeClass("16:9")}`}
                  >
                    Preview #{i + 1}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Video Link Button Section - Only shown when Admin provides a valid Video Link / demoUrl */}
          {product.demoUrl && product.demoUrl.trim() !== "" && product.demoUrl !== "#" && (
            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Video Link:</p>
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
          {/* Feature Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.isFeatured && !(product.tags || []).map((t: string)=>t.toUpperCase()).includes("FEATURED") && (
              <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
                ⭐ FEATURED
              </span>
            )}
            {(product.tags || []).map((tag: string) => {
              const uTag = tag.toUpperCase();
              if (uTag === "FEATURED") return <span key={tag} className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">⭐ FEATURED</span>;
              if (uTag === "NEW") return <span key={tag} className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">✨ NEW</span>;
              if (uTag === "POPULAR") return <span key={tag} className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">🔥 POPULAR</span>;
              if (uTag === "TRENDING") return <span key={tag} className="text-xs bg-sky-500/20 text-sky-400 border border-sky-500/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">📈 TRENDING</span>;
              if (uTag === "PREMIUM") return <span key={tag} className="text-xs bg-gradient-to-r from-amber-500/30 to-purple-500/30 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">👑 PREMIUM</span>;
              return (
                <span key={tag} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground font-mono">
                  #{tag}
                </span>
              );
            })}
          </div>

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

          <div className="text-3xl font-bold mb-6">
            {Number(product.price) <= 0 ? (
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-2xl font-black">
                🎉 FREE DOWNLOAD
              </span>
            ) : (
              <span className="text-primary">₹{Number(product.price).toFixed(2)}</span>
            )}
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="flex flex-col gap-4 mt-auto">
            {Number(product.price) <= 0 ? (
              <button
                onClick={() => handleProductAction("free")}
                className="w-full rounded-full py-4 text-lg font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/30 cursor-pointer"
              >
                ⚡ Instant Download (Free)
              </button>
            ) : (
              <button
                onClick={() => handleProductAction("cart")}
                className={`w-full rounded-full py-4 text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer ${
                  id && isInCart(id)
                    ? "bg-primary/20 text-primary border-2 border-primary/30"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {id && isInCart(id) ? "Remove from Cart ✓" : "Add to Cart"}
              </button>
            )}
            <button className="w-full rounded-full bg-muted/50 py-4 text-lg font-bold hover:bg-muted transition-colors flex items-center justify-center gap-2 border border-border">
              Add to Wishlist ❤️
            </button>
          </div>

          <AuthVerificationModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onVerifiedSuccess={handleVerifiedSuccess}
            actionTitle={Number(product.price) <= 0 ? "downloading this free item" : "purchasing this item"}
          />

          {/* 5-SECOND CONFIRMATION MODAL */}
          {confirmingAction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                {/* Live Top Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>

                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-4xl shadow-inner relative group mt-2">
                  <span className="animate-pulse">{confirmingAction === "free" ? "⚡" : "🛒"}</span>
                  <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-20"></div>
                </div>

                <h3 className="text-2xl font-black text-white mb-2">
                  {confirmingAction === "free" ? "Confirming Free Download" : "Confirming Cart Action"}
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {confirmingAction === "free"
                    ? "Validating API catalog & preparing your instant download..."
                    : "Connecting to API & updating your shopping cart..."}
                </p>

                {/* 5-Second Countdown Display */}
                <div className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 font-extrabold text-base mb-6 shadow-xl w-full">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Confirming in <span className="text-3xl text-emerald-400 font-mono font-black">{countdown}</span> seconds...</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmingAction(null)}
                    className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors text-sm border border-slate-700 cursor-pointer"
                  >
                    Cancel Action
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-border pt-8">
            <h3 className="font-bold mb-4 text-foreground">What&apos;s included:</h3>
            <ul className="space-y-3 text-muted-foreground">
              {(product.features && Array.isArray(product.features) && product.features.length > 0 ? product.features : [
                "Full source code & asset package download",
                "Comprehensive setup & usage documentation",
                "Lifetime access & updates"
              ]).map((item: string, idx: number) => (
                <li key={idx} className="flex gap-3 items-center">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-foreground/90 font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading product...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}

