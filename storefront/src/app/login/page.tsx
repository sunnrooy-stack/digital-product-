"use client";

import React, { useState } from "react";
import AuthVerificationModal from "@/components/AuthVerificationModal";
import Link from "next/link";

export default function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <AuthVerificationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          window.location.href = "/";
        }}
        onVerifiedSuccess={() => {
          window.location.href = "/dashboard";
        }}
        actionTitle="signing in to your account"
      />
    </div>
  );
}
