import React from "react";
import ClientPage from "./ClientPage";

export async function generateStaticParams() {
  try {
    const res = await fetch("https://digital-product-1-l3qr.onrender.com/api/products");
    const products = await res.json();
    if (Array.isArray(products)) {
      return products.map((p: any) => ({
        id: String(p.id),
      }));
    }
  } catch (e) {
    // ignore
  }
  return [{ id: "1" }];
}

export default function Page({ params }: { params: { id: string } }) {
  return <ClientPage />;
}
