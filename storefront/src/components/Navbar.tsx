"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import AuthVerificationModal from "./AuthVerificationModal";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const syncUserToBackend = async (uData: any) => {
    if (!uData || !uData.email) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://digital-product-1-l3qr.onrender.com";
      fetch(`${apiUrl}/api/auth/verify-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uData.displayName || uData.name || uData.email.split("@")[0],
          email: uData.email,
          dateOfBirth: uData.dateOfBirth || "N/A",
          professionalRole: uData.role || uData.professionalRole || "Freelancer",
        }),
      }).catch(() => null);
    } catch (e) {}
  };

  const checkVerifiedUser = () => {
    try {
      const stored = localStorage.getItem("verified_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setVerifiedUser(parsed);
        syncUserToBackend(parsed);
      } else {
        setVerifiedUser(null);
      }
    } catch (e) {}
  };

  useEffect(() => {
    setMounted(true);
    checkVerifiedUser();
  }, []);
  
  const itemCount = useCartStore((s) => s.itemCount());

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        syncUserToBackend(currentUser);
      }
      checkVerifiedUser();
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="max-w-[90rem] mx-auto flex items-center justify-between h-16 px-6 lg:px-12">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <img src="/logo.png" alt="Digital Products Logo" className="h-10 w-10 object-cover rounded-xl shadow-md transition-transform group-hover:scale-105" />
          <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-cyan-400">
            Digital Products
          </span>
        </Link>

        {/* Center: Search Bar (New Feature) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search premium templates, design kits, source codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="w-full bg-muted/50 border border-border/70 rounded-full pl-10 pr-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none focus:bg-background transition-all"
          />
        </div>

        {/* Right: Nav Links + Actions */}
        <div className="flex items-center gap-6">
          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart button */}
          <Link
            href="/checkout"
            className="relative p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
          >
            <span className="text-lg">🛒</span>
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown or Sign In */}
          {user || verifiedUser ? (
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all focus:outline-none cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs uppercase">
                  {(verifiedUser?.name || user?.displayName || "U").charAt(0)}
                </div>
                <span className="text-xs font-bold text-foreground max-w-[100px] truncate hidden sm:inline">
                  {verifiedUser?.name || user?.displayName || "User"}
                </span>
                {verifiedUser?.role && (
                  <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full hidden md:inline">
                    {verifiedUser.role}
                  </span>
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2.5 w-60 bg-card border border-border rounded-2xl shadow-xl p-2.5 space-y-1 text-sm animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="font-bold text-foreground truncate">{verifiedUser?.name || user?.displayName || "Verified User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{verifiedUser?.email || user?.email || "-"}</p>
                    {verifiedUser?.role && (
                      <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {verifiedUser.role}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>📊</span> Dashboard Overview
                  </Link>
                  <Link
                    href="/dashboard?tab=purchases"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>📦</span> My Purchases
                  </Link>
                  <button
                    onClick={async () => {
                      if (auth) await signOut(auth).catch(() => null);
                      localStorage.removeItem("verified_user");
                      setUser(null);
                      setVerifiedUser(null);
                      setProfileOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-full text-sm font-medium hover:bg-muted transition-colors shrink-0 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0 cursor-pointer shadow-md shadow-primary/20"
              >
                Sign Up
              </button>
            </div>
          )}

          <AuthVerificationModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onVerifiedSuccess={(userData) => {
              setIsAuthModalOpen(false);
              setVerifiedUser(userData);
            }}
            actionTitle="accessing your digital account"
          />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
          >
            <span className="text-lg">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-6 py-4 space-y-4">
          {/* Mobile Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  setMobileOpen(false);
                  window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
              className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {user ? (
            <div className="border-t border-border pt-4 space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                📊 Dashboard
              </Link>
              <button
                onClick={async () => {
                  if (auth) await signOut(auth);
                  setUser(null);
                  setMobileOpen(false);
                }}
                className="block w-full text-left py-2 text-sm text-rose-500"
              >
                🚪 Sign Out
              </button>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
