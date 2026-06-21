import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Dashboard | Premium Digital Products",
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            SellerDash
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/seller" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 font-medium">
            <span className="text-lg">📈</span> Sales Analytics
          </a>
          <a href="/seller/products" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <span className="text-lg">🛍️</span> My Products
          </a>
          <a href="/seller/upload" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <span className="text-lg">📤</span> Upload Product
          </a>
          <a href="/seller/earnings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <span className="text-lg">💰</span> Earnings & Payouts
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-background">
          <h1 className="text-xl font-bold">Seller Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-500 text-sm font-semibold">
              Pro Seller
            </div>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
