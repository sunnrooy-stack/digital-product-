"use client";

import { useState } from "react";
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword } from "@/lib/firebase";
import Link from "next/link";
import { updateProfile } from "firebase/auth";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase configuration is missing.");
      return;
    }
    if (!name || !email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      
      try {
        await fetch("https://digital-product-1-l3qr.onrender.com/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: result.user.uid,
            name: name,
            email: result.user.email
          })
        });
      } catch (e) {
        console.error("Failed to register user to DB", e);
      }
      
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to register with email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!auth) {
      setError("Firebase configuration is missing. Check .env.local");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      try {
        await fetch("https://digital-product-1-l3qr.onrender.com/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: result.user.uid,
            name: result.user.displayName,
            email: result.user.email
          })
        });
      } catch (e) {
        console.error("Failed to register user to DB", e);
      }
      
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain not authorized. Add '${window.location.hostname}' to Firebase Authorized Domains.`);
      } else {
        setError(err.message || "Failed to register with Google");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12 mt-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-10 rounded-3xl border border-border">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Join us to access premium digital products</p>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailRegister} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-3 text-xs text-muted-foreground uppercase">Or continue with</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        <button
          onClick={handleGoogleRegister}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl shadow-sm bg-card text-foreground hover:bg-muted focus:outline-none transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-medium">Google</span>
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
