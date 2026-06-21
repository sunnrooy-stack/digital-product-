"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(res => res.json()),
      fetch("/api/products").then(res => res.json())
    ]).then(([catsData, prodsData]) => {
      if (Array.isArray(catsData)) setCategories(catsData);
      if (Array.isArray(prodsData)) setProducts(prodsData);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading categories page data:", err);
      setLoading(false);
    });
  }, []);

  const categoryIcons = ["🧠", "📚", "🎓", "🎨", "✨", "💻", "🎛️", "🖼️", "🧰", "📸", "🎵", "🎮", "🚀", "💡", "📦", "🎯"];
  const categoryColors = [
    "bg-blue-500/10 text-blue-500",
    "bg-pink-500/10 text-pink-500",
    "bg-indigo-500/10 text-indigo-500",
    "bg-emerald-500/10 text-emerald-500",
    "bg-purple-500/10 text-purple-500",
    "bg-orange-500/10 text-orange-500",
    "bg-rose-500/10 text-rose-500",
    "bg-sky-500/10 text-sky-500",
    "bg-amber-500/10 text-amber-500",
    "bg-teal-500/10 text-teal-500",
    "bg-cyan-500/10 text-cyan-500",
    "bg-fuchsia-500/10 text-fuchsia-500",
    "bg-lime-500/10 text-lime-500",
    "bg-violet-500/10 text-violet-500",
    "bg-red-500/10 text-red-500",
    "bg-yellow-500/10 text-yellow-500",
  ];

  return (
    <div className="py-20 px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Browse Categories</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find exactly what you need from our curated collections of premium digital assets.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center text-muted-foreground">No categories found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const count = products.filter(p => p.category.toLowerCase() === category.name.toLowerCase()).length;
            const icon = categoryIcons[index % categoryIcons.length];
            const color = categoryColors[index % categoryColors.length];
            
            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="glass-panel p-6 rounded-2xl flex items-center gap-6 cursor-pointer hover:scale-[1.02] transition-all"
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${color}`}>
                  {icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{category.name}</h2>
                  <p className="text-muted-foreground">{count} products</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
