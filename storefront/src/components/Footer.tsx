import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Digital Products
            </span>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Discover the best digital products, e-books, templates, and AI prompts from industry professionals.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4 text-sm text-foreground">Products</h3>
            <ul className="space-y-2">
              <li><Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">E-books</Link></li>
              <li><Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</Link></li>
              <li><Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Source Code</Link></li>
              <li><Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Prompts</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-sm text-foreground">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-sm text-foreground">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Account</Link></li>
              <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Products</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Digital Products. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">𝕏</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">GitHub</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Discord</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
