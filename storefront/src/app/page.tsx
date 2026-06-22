"use client";

import React, { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import { useCartStore, CartItem } from "@/store/cart";
import { motion } from "framer-motion";
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
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [storeCategories, setStoreCategories] = useState<any[]>([]);

  // Fetch real-time products list and categories
  useEffect(() => {
    fetch(`https://digital-product-1-l3qr.onrender.com/api/products?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter to only show Featured products in Trending
          const featuredProducts = data.filter((p: any) => p.isFeatured === true);
          
          let mapped = featuredProducts.map((p: any) => ({
            id: String(p.id),
            title: p.title,
            price: Number(p.price),
            coverImage: p.coverImage || "",
            sellerName: p.sellerName || "Admin",
          }));
          
          // Fallback so it doesn't look empty when the DB is brand new
          if (data.length === 0) {
            mapped = [
              { id: "1", title: "SaaS Starter Kit", price: 89, coverImage: "", sellerName: "DevPro" },
              { id: "2", title: "AI Prompt Pack", price: 29, coverImage: "", sellerName: "PromptMaster" },
              { id: "3", title: "React Dashboard", price: 49, coverImage: "", sellerName: "UIForge" }
            ];
          }
          
          setProducts(mapped);
        }
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.log("Failed to load real-time products", err);
        setLoadingProducts(false);
      });

    fetch("https://digital-product-1-l3qr.onrender.com/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStoreCategories(data);
        }
      })
      .catch((err) => console.log("Failed to load categories:", err));
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

      {/* Featured Products Section */}
      <section className="py-20 px-6 lg:px-12 max-w-[90rem] mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
            Trending Products
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hand-picked premium assets to accelerate your projects.
          </p>
        </div>

        {loadingProducts ? (
          <div className="text-center text-muted-foreground py-10">Loading trending products...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 glass-panel border border-border/70 rounded-3xl mx-auto max-w-lg">
            <span className="text-4xl block mb-4">🛒</span>
            <p className="font-semibold text-foreground">No Products Available</p>
            <p className="text-sm">Products added from the Admin panel will appear here in real-time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product, index) => {
              const inCart = isInCart(product.id);
              const gradientIndex = index % gradients.length;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="glass-panel rounded-2xl p-4 transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <a href={`/product?id=${product.id}`}>
                      <div className={`aspect-video w-full rounded-xl bg-gradient-to-br ${gradients[gradientIndex]} mb-4 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
                      {product.coverImage ? (
                        <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-white/70 text-4xl">
                          {["📦", "🤖", "📊", "📚", "🎬", "🎨", "💻", "✨"][gradientIndex]}
                        </span>
                      )}
                    </div>
                  </a>
                  <p className="text-xs text-muted-foreground mb-1">by {product.sellerName}</p>
                  <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-lg text-primary">₹{product.price.toFixed(2)}</span>
                    <button
                      onClick={() => inCart ? removeItem(product.id) : addItem(product)}
                      className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
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
    </div>
  );
}
