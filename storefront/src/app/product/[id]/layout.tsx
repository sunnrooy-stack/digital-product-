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
  return [];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
