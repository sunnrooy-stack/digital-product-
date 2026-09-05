"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthVerificationModal from "@/components/AuthVerificationModal";
import { getPersonalizedProducts, getActiveUser } from "@/lib/personalization";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get("tab") : null;
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [recommendedPicks, setRecommendedPicks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const checkVerifiedUser = () => {
    try {
      const stored = localStorage.getItem("verified_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setVerifiedUser(parsed);
        return parsed;
      }
    } catch (e) {}
    return null;
  };

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab("overview");
    }
  }, [tabParam]);

  useEffect(() => {
    const vUser = checkVerifiedUser();
    if (!vUser) {
      setIsAuthModalOpen(true);
    }

    if (!auth) {
      setIsLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      const userEmail = currentUser?.email || vUser?.email;
      
      if (userEmail) {
        try {
          let res = await fetch("http://localhost:5000/api/orders").catch(() => null);
          if (!res || !res.ok) {
            res = await fetch("https://digital-product-1-l3qr.onrender.com/api/orders").catch(() => null);
          }
          if (res && res.ok) {
            const allOrders = await res.json();
            if (Array.isArray(allOrders)) {
              const userOrders = allOrders.filter((order: any) => 
                order.email && order.email.toLowerCase() === userEmail.toLowerCase()
              );
              const formattedPurchases = userOrders.map((order: any) => {
                const firstItem = Array.isArray(order.items) && order.items.length > 0 ? order.items[0] : null;
                const fileUrls = Array.isArray(order.items)
                  ? order.items.flatMap((i: any) => i.product?.fileUrls || i.fileUrls || [])
                  : [];
                return {
                  id: order.id || order.orderNumber || order.paymentId,
                  title: order.product || (firstItem ? firstItem.product?.title || "Digital Asset" : "Digital Product"),
                  date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order.date || "Recent"),
                  icon: "📦", 
                  version: "v1.0.0", 
                  size: "Full Package",
                  fileUrls: fileUrls,
                  paymentId: order.paymentId || order.orderNumber || order.id,
                  totalAmount: order.totalAmount,
                };
              });
              setPurchases(formattedPurchases);
            }
          }
        } catch (err) {
          console.error("Failed to fetch user orders", err);
        }

        // Fetch products to generate personalized recommendations for user
        try {
          let pRes = await fetch("http://localhost:5000/api/products").catch(() => null);
          if (!pRes || !pRes.ok) {
            pRes = await fetch("https://digital-product-1-l3qr.onrender.com/api/products").catch(() => null);
          }
          if (pRes && pRes.ok) {
            const allProds = await pRes.json();
            if (Array.isArray(allProds)) {
              const ranked = getPersonalizedProducts(allProds, vUser || getActiveUser());
              setRecommendedPicks(ranked.slice(0, 3));
            }
          }
        } catch (e) {}
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDownload = (prod: any) => {
    if (prod.fileUrls && prod.fileUrls.length > 0) {
      prod.fileUrls.forEach((url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
      });
    } else if (prod.paymentId) {
      window.location.href = `/success?payment_id=${prod.paymentId}`;
    } else {
      alert("Preparing package files... Please check your email for the direct download link.");
    }
  };

  const handleInvoice = (prod: any) => {
    const invoiceDetails = `INVOICE RECEIPT\nOrder/Payment ID: ${prod.paymentId || prod.id}\nItem: ${prod.title}\nDate: ${prod.date}\nStatus: PAID & COMPLETED\nAmount: ₹${Number(prod.totalAmount || 0).toFixed(2)}`;
    alert(invoiceDetails);
  };

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (!user && !verifiedUser) {
    return (
      <div className="py-12">
        <AuthVerificationModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            window.location.href = "/";
          }}
          onVerifiedSuccess={(uData) => {
            setVerifiedUser(uData);
            setIsAuthModalOpen(false);
          }}
          actionTitle="accessing your user dashboard"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {verifiedUser?.role || "Member"} Profile
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight capitalize">
            {activeTab === "overview" ? `Welcome, ${verifiedUser?.name || "User"}` : `${activeTab} Details`}
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
              <p className="text-sm font-medium text-muted-foreground mb-2">Your Interest Profile</p>
              <p className="text-xl font-extrabold text-foreground">{verifiedUser?.role || "Creator"}</p>
            </div>
          </div>

          {/* PERSONALIZED RECOMMENDATION PICKS */}
          {recommendedPicks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span>✨</span> Recommended for {verifiedUser?.name || "You"}
                  </h3>
                  <p className="text-xs text-muted-foreground">Curated based on your {verifiedUser?.role || "role"} and recent activity.</p>
                </div>
                <a href="/products" className="text-xs font-bold text-primary hover:underline">
                  Browse All →
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedPicks.map((p: any) => (
                  <a
                    key={p.id}
                    href={`/product?id=${p.id}`}
                    className="glass-panel p-4 rounded-2xl border border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="h-28 w-full rounded-xl bg-slate-900 mb-3 overflow-hidden flex items-center justify-center">
                        {p.coverImage ? (
                          <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>
                      {p.recommendationReason && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 line-clamp-1 mb-1.5 inline-block">
                          {p.recommendationReason}
                        </span>
                      )}
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{p.title}</h4>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-3">
                      <span className="font-extrabold text-sm text-primary">
                        {Number(p.price) <= 0 ? "FREE" : `₹${Number(p.price).toFixed(2)}`}
                      </span>
                      <span className="text-xs text-primary font-bold">View Asset →</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

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
                    <button 
                      onClick={() => handleDownload(prod)}
                      className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-colors shadow"
                    >
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
                    <button 
                      onClick={() => handleDownload(prod)}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow"
                    >
                      Download Files
                    </button>
                    <button 
                      onClick={() => handleInvoice(prod)}
                      className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-xs font-semibold rounded-xl transition-colors"
                    >
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
              <input type="text" defaultValue={user?.displayName || verifiedUser?.name || "User"} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
              <input type="email" defaultValue={user?.email || verifiedUser?.email || ""} disabled className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed focus:outline-none" />
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
