import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Panel | Digital Product Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground flex min-h-screen">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-border">
            <span className="font-extrabold text-xl tracking-tight text-primary">
              Admin Control
            </span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium">
              <span className="text-lg">📈</span> Overview
            </Link>
            <Link href="/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="text-lg">👥</span> Users
            </Link>

            <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Product Management
            </div>
            <Link href="/products?tab=list" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="text-lg">📦</span> All Products
            </Link>
            <Link href="/products/create" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="text-lg">📤</span> Upload & Create
            </Link>
            <Link href="/categories" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="text-lg">📂</span> Categories
            </Link>
            <Link href="/products?tab=analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="text-lg">📊</span> Product Stats
            </Link>

            <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Sales & Config
            </div>
            <Link href="/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="text-lg">💳</span> Orders & Refunds
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="text-lg">⚙️</span> Site Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-background">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                Super Admin
              </div>
            </div>
          </header>
          <div className="flex-1 p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
