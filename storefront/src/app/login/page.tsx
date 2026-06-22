"use client";

import { useState } from "react";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError("Firebase configuration is missing. Check .env.local");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
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
      
      console.log("Logged in!", token);
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to login with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full space-y-8 glass-panel p-10 rounded-3xl border border-border">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to access your Digital Products account</p>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl shadow-sm bg-card text-foreground hover:bg-muted focus:outline-none transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
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
            )}
            <span className="font-medium">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
