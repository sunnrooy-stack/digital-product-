"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]); // Mock empty wishlist for now
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab("overview");
    }
  }, [tabParam]);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser && currentUser.email) {
        // Fetch user's orders
        try {
          const res = await fetch("https://digital-product-1-l3qr.onrender.com/api/orders");
          const allOrders = await res.json();
          if (Array.isArray(allOrders)) {
            const userOrders = allOrders.filter((order: any) => order.email === currentUser.email);
            // Transform orders to match the UI shape
            const formattedPurchases = userOrders.map((order: any) => ({
              id: order.id,
              title: order.product,
              date: order.date,
              icon: "📦", 
              version: "v1.0.0", 
              size: "Available in Dashboard"
            }));
            setPurchases(formattedPurchases);
          }
        } catch (err) {
          console.error("Failed to fetch user orders", err);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h2>
        <a href="/login" className="px-6 py-3 bg-primary text-white rounded-full font-bold">Sign In</a>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight capitalize">
            {activeTab === "overview" ? "My Dashboard" : `${activeTab} Details`}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Access your templates, manage preferences, and review your account activity.
          </p>
        </div>
        <div className="flex gap-2 bg-muted/50 p-1.5 rounded-xl border border-border">
          {["overview", "purchases", "wishlist", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                activeTab === tab 
                  ? "bg-primary text-white shadow" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Purchases</p>
              <p className="text-4xl font-extrabold text-primary">{purchases.length}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <p className="text-sm font-medium text-muted-foreground mb-2">Wishlisted Items</p>
              <p className="text-4xl font-extrabold">{wishlist.length}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <p className="text-sm font-medium text-muted-foreground mb-2">Reviews Left</p>
              <p className="text-4xl font-extrabold">0</p>
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-2xl font-bold">Recent Purchases</h3>
            {purchases.length === 0 ? (
              <div className="glass-panel p-10 text-center rounded-2xl border border-border/70 text-muted-foreground">
                You haven&apos;t purchased anything yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchases.map((prod) => (
                  <div key={prod.id} className="glass-panel p-5 rounded-2xl flex items-center justify-between border border-border/70">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                        {prod.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{prod.title}</h4>
                        <p className="text-xs text-muted-foreground">Purchased on {prod.date}</p>
                      </div>
                    </div>
                    <button className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-colors shadow">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* PURCHASES TAB */}
      {activeTab === "purchases" && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Downloads Library</h3>
          <div className="space-y-4">
            {purchases.length === 0 ? (
               <div className="glass-panel p-10 text-center rounded-2xl border border-border text-muted-foreground">
                 Your library is empty. Browse the store to find amazing products!
               </div>
            ) : (
              purchases.map((prod) => (
                <div key={prod.id} className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
                      {prod.icon}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xl">{prod.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span>Purchased: <strong className="text-foreground">{prod.date}</strong></span>
                        <span>Version: <strong className="text-foreground">{prod.version}</strong></span>
                        <span>File Size: <strong className="text-foreground">{prod.size}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow">
                      Download Files (.zip)
                    </button>
                    <button className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-xs font-semibold rounded-xl transition-colors">
                      📄 Invoice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* WISHLIST TAB */}
      {activeTab === "wishlist" && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">My Saved Wishlist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.length === 0 ? (
              <div className="col-span-full glass-panel p-10 text-center rounded-2xl border border-border text-muted-foreground">
                 No items in your wishlist.
              </div>
            ) : (
              wishlist.map((item) => (
                <div key={item.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-4 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-primary font-extrabold text-sm mt-0.5">{item.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <a href={`/product?id=${item.id}`} className="flex-1 text-center py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors">
                      View Details
                    </a>
                    <button className="px-3 py-2 bg-muted hover:bg-muted/80 text-xs font-semibold rounded-lg transition-colors">
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="glass-panel p-8 rounded-2xl space-y-6 border border-border">
          <h3 className="text-2xl font-bold border-b border-border pb-3">Account Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Display Name</label>
              <input type="text" defaultValue={user.displayName || "User"} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
              <input type="email" defaultValue={user.email} disabled className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-4 border-t border-border">
            <input type="checkbox" defaultChecked className="accent-primary w-5 h-5 cursor-pointer" id="notify-updates" />
            <label htmlFor="notify-updates" className="cursor-pointer text-sm font-semibold select-none text-muted-foreground hover:text-foreground">
              Notify me via email when my purchased products release updates
            </label>
          </div>
          <div className="flex justify-end pt-2">
            <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow">
              Save Profile Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardOverview() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Loading User Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
