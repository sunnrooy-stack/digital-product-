"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_PASSCODE = "sunny143";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      localStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect passcode. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
  };

  if (!isMounted) return null; // Prevent hydration mismatch

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -z-10" />

        <div className="glass-panel p-10 rounded-3xl w-full max-w-md border border-border/50 shadow-2xl z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-2 tracking-tight">Admin Authentication</h1>
          <p className="text-muted-foreground text-sm text-center mb-8">
            Enter the master passcode to access the digital product store dashboard.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all text-center tracking-widest text-lg font-mono"
                autoFocus
              />
            </div>
            {error && <p className="text-rose-500 text-sm font-semibold text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Unlock Dashboard
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Digital Product Store. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen w-full">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-extrabold text-xl tracking-tight text-primary">
            Admin Control
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="https://digitals-product-store.onrender.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-bold mb-4">
            <span className="text-lg">🛒</span> View Storefront
          </a>
          <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === "/" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <span className="text-lg">📈</span> Overview
          </Link>
          <Link href="/users" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === "/users" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <span className="text-lg">👥</span> Users
          </Link>

          <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Product Management
          </div>
          <Link href="/products?tab=list" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes("/products") && !pathname.includes("/categories") ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <span className="text-lg">📦</span> All Products
          </Link>
          <Link href="/products/create" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === "/products/create" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <span className="text-lg">📤</span> Upload & Create
          </Link>
          <Link href="/categories" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === "/categories" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <span className="text-lg">📂</span> Categories
          </Link>
          <Link href="/products?tab=analytics" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname.includes("analytics") ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <span className="text-lg">📊</span> Product Stats
          </Link>

          <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Sales & Config
          </div>
          <Link href="/orders" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === "/orders" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <span className="text-lg">💳</span> Orders & Refunds
          </Link>
          <Link href="/settings" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === "/settings" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <span className="text-lg">⚙️</span> Site Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full min-w-0">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-background">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-semibold">
              Super Admin
            </div>
            <button 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-rose-500 transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
