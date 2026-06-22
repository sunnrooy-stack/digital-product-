import React, { Suspense } from "react";
import ClientPage from "./ClientPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading product...</div>}>
      <ClientPage />
    </Suspense>
  );
}
