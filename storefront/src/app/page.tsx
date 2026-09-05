"use client";

import React, { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import { useCartStore, CartItem } from "@/store/cart";
import AuthVerificationModal from "@/components/AuthVerificationModal";
import { motion } from "framer-motion";
import { getPersonalizedProducts, recordProductView, getActiveUser, getUserSearches, UserPersonalizationProfile } from "@/lib/personalization";

const gradients = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
  "from-lime-500 to-green-600",
  "from-red-500 to-pink-600",
];

export default function Home() {
  const { addItem, removeItem, isInCart } = useCartStore();
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [storeCategories, setStoreCategories] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<CartItem | null>(null);
  const [currentUser, setCurrentUser] = useState<UserPersonalizationProfile | null>(null);
  const [feedMode, setFeedMode] = useState<"personalized" | "all">("personalized");
  const [recentSearchTags, setRecentSearchTags] = useState<string[]>([]);

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

  const syncCurrentUser = () => {
    const u = getActiveUser();
    setCurrentUser(u);
    if (u) {
      setRecentSearchTags(getUserSearches(u.email));
    }
  };

  // Re-rank products whenever raw products, user, or feedMode changes
  useEffect(() => {
    if (rawProducts.length === 0) return;
    if (feedMode === "personalized") {
      const ranked = getPersonalizedProducts(rawProducts, currentUser);
      setProducts(ranked);
    } else {
      setProducts(rawProducts);
    }
  }, [rawProducts, currentUser, feedMode]);

  // Listen to personalization updates (like search from navbar)
  useEffect(() => {
    syncCurrentUser();
    const handlePersonalizationUpdate = () => {
      syncCurrentUser();
      if (rawProducts.length > 0) {
        const updated = getPersonalizedProducts(rawProducts, getActiveUser());
        setProducts(updated);
      }
    };
    window.addEventListener("personalization_updated", handlePersonalizationUpdate);
    window.addEventListener("storage", syncCurrentUser);
    return () => {
      window.removeEventListener("personalization_updated", handlePersonalizationUpdate);
      window.removeEventListener("storage", syncCurrentUser);
    };
  }, [rawProducts]);

  // Fetch real-time products list and categories
  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      const DEFAULT_PRODUCTS = [
        { id: "1", title: "SaaS Starter Kit", price: 89, coverImage: "", sellerName: "DevPro", tags: ["FEATURED", "NEW", "REACT", "SAAS"], isFeatured: true, category: "Templates", description: "Production-ready SaaS template with auth and stripe" },
        { id: "2", title: "AI Prompt Pack", price: 29, coverImage: "", sellerName: "PromptMaster", tags: ["TRENDING", "POPULAR", "AI", "PROMPTS"], isFeatured: true, category: "AI Prompts", description: "500+ curated prompts for ChatGPT and Midjourney" },
        { id: "3", title: "React Dashboard", price: 49, coverImage: "", sellerName: "UIForge", tags: ["PREMIUM", "REACT", "UI"], isFeatured: true, category: "Templates", description: "Responsive analytics dashboard components" },
        { id: "4", title: "DaVinci Resolve Cinematic LUTs", price: 35, coverImage: "", sellerName: "FilmGrade", tags: ["PRESETS", "VIDEO", "DAVINCI"], isFeatured: true, category: "Presets", description: "Hollywood grade color LUTs and transitions" },
        { id: "5", title: "Freelancer Contract & Pitch Kit", price: 25, coverImage: "", sellerName: "StudioLegal", tags: ["BUSINESS", "FREELANCE"], isFeatured: true, category: "Templates", description: "Design proposals, client contracts, and invoices" }
      ];

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
        const baseList = (Array.isArray(data) && data.length > 0) ? data : DEFAULT_PRODUCTS;
        const map = new Map<string, any>();
        const titleMap = new Map<string, string>();

        baseList.forEach((p) => {
          map.set(String(p.id), p);
          if (p.title) titleMap.set(p.title.trim().toLowerCase(), String(p.id));
        });

        localProducts.forEach((p) => {
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

        const mergedList = Array.from(map.values()).map((p: any) => ({
          id: String(p.id),
          title: p.title,
          price: Number(p.price),
          coverImage: p.coverImage || "",
          sellerName: p.sellerName || "Admin",
          category: p.category || "General",
          description: p.description || "",
          tags: p.tags || [],
          isFeatured: p.isFeatured !== false,
        }));

        setRawProducts(mergedList);
        const user = getActiveUser();
        const initialPersonalized = getPersonalizedProducts(mergedList, user);
        setProducts(initialPersonalized);
        setLoadingProducts(false);
      }

      try {
        let catData: any[] | null = null;
        const localCat = await fetch("http://localhost:5000/api/categories").catch(() => null);
        if (localCat && localCat.ok) {
          catData = await localCat.json().catch(() => null);
        }
        if (!catData || !Array.isArray(catData)) {
          const remoteCat = await fetch("https://digital-product-1-l3qr.onrender.com/api/categories").catch(() => null);
          if (remoteCat && remoteCat.ok) {
            catData = await remoteCat.json().catch(() => null);
          }
        }
        if (isMounted && Array.isArray(catData)) {
          setStoreCategories(catData);
        }
      } catch (e) {}
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryIcons = ["🧠", "📚", "🎓", "🎨", "✨", "💻", "🎛️", "🖼️", "🧰", "📸", "🎵", "🎮", "🚀", "💡", "📦", "🎯"];
  const categoryColors = [
    "from-blue-500/20 to-blue-600/5",
    "from-pink-500/20 to-pink-600/5",
    "from-indigo-500/20 to-indigo-600/5",
    "from-emerald-500/20 to-emerald-600/5",
    "from-purple-500/20 to-purple-600/5",
    "from-orange-500/20 to-orange-600/5",
    "from-rose-500/20 to-rose-600/5",
    "from-sky-500/20 to-sky-600/5",
    "from-amber-500/20 to-amber-600/5",
    "from-teal-500/20 to-teal-600/5",
    "from-cyan-500/20 to-cyan-600/5",
    "from-fuchsia-500/20 to-fuchsia-600/5",
    "from-lime-500/20 to-lime-600/5",
    "from-violet-500/20 to-violet-600/5",
    "from-red-500/20 to-red-600/5",
    "from-yellow-500/20 to-yellow-600/5",
  ];

  return (
    <div className="flex flex-col">
      <HeroSection />

      {/* Featured / Personalized Products Section */}
      <section className="py-20 px-6 lg:px-12 max-w-[90rem] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            {currentUser ? (
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Personalized for {currentUser.name} • {currentUser.role}
                </span>
              </div>
            ) : null}
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              {currentUser ? "✨ Recommended For You" : "🔥 Trending Products"}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              {currentUser
                ? `Algorithmic feed tailored to your ${currentUser.role} interests, searches & activity.`
                : "Hand-picked premium assets to accelerate your projects."}
            </p>
          </div>

          {/* Algorithm Feed Mode Toggle */}
          <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-2xl border border-border shrink-0 self-start md:self-auto">
            <button
              onClick={() => setFeedMode("personalized")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                feedMode === "personalized"
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>✨</span> Algorithmic Feed
            </button>
            <button
              onClick={() => setFeedMode("all")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                feedMode === "all"
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>📋</span> All Products
            </button>
          </div>
        </div>

        {/* Recent Search Interest Chips */}
        {recentSearchTags.length > 0 && feedMode === "personalized" && (
          <div className="flex items-center gap-2 mb-6 flex-wrap animate-in fade-in">
            <span className="text-xs font-semibold text-muted-foreground">Your search signals:</span>
            {recentSearchTags.slice(0, 5).map((query, i) => (
              <a
                key={i}
                href={`/products?search=${encodeURIComponent(query)}`}
                className="text-xs px-3 py-1 rounded-full bg-muted border border-border hover:border-primary/50 text-foreground/80 hover:text-primary transition-all flex items-center gap-1"
              >
                <span>🔍</span> {query}
              </a>
            ))}
          </div>
        )}

        {loadingProducts ? (
          <div className="text-center text-muted-foreground py-10">Loading personalized products...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 glass-panel border border-border/70 rounded-3xl mx-auto max-w-lg">
            <span className="text-4xl block mb-4">🛒</span>
            <p className="font-semibold text-foreground">No Products Available</p>
            <p className="text-sm">Products added from the Admin panel will appear here in real-time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 lg:gap-5">
            {products.map((product: any, index) => {
              const inCart = isInCart(product.id);
              const gradientIndex = index % gradients.length;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="glass-panel rounded-2xl p-3.5 transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                  onClick={() => recordProductView(product, currentUser?.email)}
                >
                  <div>
                    <a href={`/product?id=${product.id}`}>
                      <div className={`aspect-video w-full rounded-xl bg-gradient-to-br ${gradients[gradientIndex]} mb-3 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity relative overflow-hidden`}>
                        {product.coverImage ? (
                          <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-white/70 text-4xl">
                            {["📦", "🤖", "📊", "📚", "🎬", "🎨", "💻", "✨"][gradientIndex]}
                          </span>
                        )}

                        {/* Feature Badge Overlay on Image (Replaced Match %) */}
                        {(() => {
                          const tagsUpper = (product.tags || []).map((t: string) => t.toUpperCase());
                          if (product.isFeatured || tagsUpper.includes("FEATURED")) {
                            return (
                              <div className="absolute top-2 right-2 z-10 shadow-md">
                                <span className="text-[10px] bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  FEATURED
                                </span>
                              </div>
                            );
                          }
                          if (tagsUpper.includes("NEW")) {
                            return (
                              <div className="absolute top-2 right-2 z-10 shadow-md">
                                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  NEW
                                </span>
                              </div>
                            );
                          }
                          if (tagsUpper.includes("POPULAR")) {
                            return (
                              <div className="absolute top-2 right-2 z-10 shadow-md">
                                <span className="text-[10px] bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  POPULAR
                                </span>
                              </div>
                            );
                          }
                          if (tagsUpper.includes("TRENDING")) {
                            return (
                              <div className="absolute top-2 right-2 z-10 shadow-md">
                                <span className="text-[10px] bg-cyan-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  TRENDING
                                </span>
                              </div>
                            );
                          }
                          if (tagsUpper.includes("PREMIUM")) {
                            return (
                              <div className="absolute top-2 right-2 z-10 shadow-md">
                                <span className="text-[10px] bg-red-600 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  PREMIUM
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </a>

                    {/* Algorithmic Reason Pill */}
                    {feedMode === "personalized" && product.recommendationReason && (
                      <div className="mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 line-clamp-1">
                          {product.recommendationReason}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mb-1">by {product.sellerName}</p>
                    <h3 className="font-semibold text-base mb-2 line-clamp-2">{product.title}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2 gap-2">
                    {product.price <= 0 ? (
                      <span className="font-black text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        🎉 FREE
                      </span>
                    ) : (
                      <span className="font-bold text-base text-primary">₹{product.price.toFixed(2)}</span>
                    )}

                    {product.price <= 0 ? (
                      <a
                        href={`/product?id=${product.id}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
                      >
                        ⚡ Free
                      </a>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          inCart ? removeItem(product.id) : addItem(product);
                        }}
                        className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                          inCart
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-foreground text-background hover:bg-foreground/90"
                        }`}
                      >
                        {inCart ? "In Cart ✓" : "Add to Cart"}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Categories Showcase */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
              Browse by Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Find exactly what you need.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {storeCategories.map((cat, index) => {
              const icon = categoryIcons[index % categoryIcons.length];
              const color = categoryColors[index % categoryColors.length];
              return (
                <a
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`bg-gradient-to-br ${color} border border-border rounded-2xl p-6 text-center hover:scale-105 transition-all flex flex-col items-center justify-center min-h-[140px]`}
                >
                  <span className="text-3xl block mb-2">{icon}</span>
                  <span className="font-semibold text-sm line-clamp-2 px-1">{cat.name}</span>
                </a>
              );
            })}
            {storeCategories.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No categories available.
              </div>
            )}
          </div>
        </div>
      </section>

      <AuthVerificationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onVerifiedSuccess={() => {
          setIsAuthModalOpen(false);
          if (pendingProduct) {
            addItem(pendingProduct);
            setPendingProduct(null);
          }
        }}
        actionTitle="purchasing or getting free products"
      />
    </div>
  );
}
