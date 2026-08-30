import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Premium Digital Products | Store",
  description: "Discover the best digital products, e-books, templates, and AI prompts.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-primary selection:text-white`}>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </div>
        <AIChatWidget />
      </body>
    </html>
  );
}
