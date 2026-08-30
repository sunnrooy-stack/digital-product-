"use client";

import React, { useState } from "react";
import AuthVerificationModal from "@/components/AuthVerificationModal";

export default function RegisterPage() {
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
        actionTitle="creating your new account"
      />
    </div>
  );
}
