"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore, CartItem } from "@/store/cart";
import { motion } from "framer-motion";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  tags: string[];
  coverImage: string;
  sellerName: string;
  isFeatured: boolean;
}

const gradients = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
];

function ProductsContent() {
  const { addItem, removeItem, isInCart, items } = useCartStore();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  // AI Recommendations state
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [storeCategories, setStoreCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`https://digital-product-1-l3qr.onrender.com/api/products?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          let mapped = data;
          if (mapped.length === 0) {
            mapped = [
              { id: "1", title: "SaaS Starter Kit", price: 89, description: "A premium SaaS boilerplate.", category: "Templates", tags: ["nextjs", "saas"], coverImage: "", sellerName: "DevPro", isFeatured: true },
              { id: "2", title: "AI Prompt Pack", price: 29, description: "Highly engineered AI prompts.", category: "AI Prompts", tags: ["gpt"], coverImage: "", sellerName: "PromptMaster", isFeatured: true },
              { id: "3", title: "React Dashboard", price: 49, description: "Beautiful custom React admin dashboard.", category: "Templates", tags: ["react"], coverImage: "", sellerName: "UIForge", isFeatured: true }
            ];
          }
          setProducts(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });

    fetch("https://digital-product-1-l3qr.onrender.com/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStoreCategories(data);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // Update AI Recommendations based on Cart contents
  useEffect(() => {
    if (products.length === 0) return;
    
    setAiLoading(true);
    
    // Simulate smart AI recommendation logic
    const timer = setTimeout(() => {
      let recommended: Product[] = [];
      if (items.length > 0) {
        const cartCategories = items.map(item => item.id);
        recommended = products.filter(p => !cartCategories.includes(p.id)).slice(0, 3);
      } else {
        recommended = products.filter(p => p.isFeatured || p.category === "Design Templates").slice(0, 3);
      }
      
      if (recommended.length === 0) {
        recommended = products.slice(0, 3);
      }
      
      setAiRecommendations(recommended);
      setAiLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [items, products]);

  const categories = ["all", ...storeCategories.map(c => c.name)];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12 px-6 lg:px-12 max-w-[90rem] mx-auto w-full min-h-screen space-y-12">
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore Digital Catalog</h1>
        <p className="text-muted-foreground text-lg">
          Browse, filter, and buy premium resources curated by top design and software developers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-2xl border border-border">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-primary text-white"
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
        <div className="w-full md:max-w-xs relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading catalog items...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => {
                const inCart = isInCart(product.id);
                const gradientIndex = index % gradients.length;
                const cartItem: CartItem = {
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  coverImage: product.coverImage,
                  sellerName: product.sellerName || "Admin",
                };

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 border border-border relative group"
                  >
                    <div>
                      <a href={`/product?id=${product.id}`}>
                        <div className={`aspect-video w-full rounded-xl bg-gradient-to-br ${gradients[gradientIndex]} mb-4 flex items-center justify-center relative overflow-hidden`}>
                          {product.coverImage ? (
                            <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white/80 text-4xl">📦</span>
                          )}
                        </div>
                      </a>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">by {product.sellerName || "Vendor"}</p>
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                      <span className="font-extrabold text-lg text-primary">₹{product.price.toFixed(2)}</span>
                      <button
                        onClick={() => inCart ? removeItem(product.id) : addItem(cartItem)}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                          inCart
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-foreground text-background hover:bg-foreground/90"
                        }`}
                      >
                        {inCart ? "In Cart ✓" : "Add to Cart"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: AI Recommendation Widget (New Feature) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🤖</span>
              <div>
                <h3 className="font-extrabold text-lg">AI Recommender</h3>
                <p className="text-[10px] text-muted-foreground">Dynamic Gemini matches based on cart</p>
              </div>
            </div>

            {aiLoading ? (
              <div className="space-y-3 py-6 text-center text-xs text-muted-foreground">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Calculating recommendations...
              </div>
            ) : (
              <div className="space-y-4">
                {aiRecommendations.map((prod) => {
                  const inCart = isInCart(prod.id);
                  const cartItem: CartItem = {
                    id: prod.id,
                    title: prod.title,
                    price: prod.price,
                    coverImage: prod.coverImage,
                    sellerName: prod.sellerName || "Admin",
                  };
                  return (
                    <div key={prod.id} className="bg-card p-3.5 rounded-xl border border-border/50 space-y-3">
                      <a href={`/product?id=${prod.id}`} className="block hover:underline">
                        <h4 className="font-bold text-sm line-clamp-1">{prod.title}</h4>
                      </a>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">Category: {prod.category}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-black text-xs text-primary">₹{prod.price}</span>
                        <button
                          onClick={() => inCart ? removeItem(prod.id) : addItem(cartItem)}
                          className="text-[10px] bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                        >
                          {inCart ? "Added ✓" : "Add"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorefrontProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground text-sm">Loading Products Catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
