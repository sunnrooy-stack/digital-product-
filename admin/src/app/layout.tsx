import type { Metadata } from "next";
import "./globals.css";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";

export const metadata: Metadata = {
  title: "Admin Panel | Digital Product Store",
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
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <AdminLayoutWrapper>
          {children}
        </AdminLayoutWrapper>
      </body>
    </html>
  );
}
