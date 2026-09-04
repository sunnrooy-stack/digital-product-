"use client";

import React, { useState, useEffect } from "react";

export default function AdminSettings() {
  const [platformFee, setPlatformFee] = useState<number>(5);
  const [payoutThreshold, setPayoutThreshold] = useState<number>(50);
  const [allowSellerSignups, setAllowSellerSignups] = useState<boolean>(true);
  const [autoProductApproval, setAutoProductApproval] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_platform_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.platformFee !== undefined) setPlatformFee(parsed.platformFee);
        if (parsed.payoutThreshold !== undefined) setPayoutThreshold(parsed.payoutThreshold);
        if (parsed.allowSellerSignups !== undefined) setAllowSellerSignups(parsed.allowSellerSignups);
        if (parsed.autoProductApproval !== undefined) setAutoProductApproval(parsed.autoProductApproval);
      }
    } catch (e) {}
  }, []);

  const handleSave = () => {
    try {
      const settings = {
        platformFee,
        payoutThreshold,
        allowSellerSignups,
        autoProductApproval,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem("admin_platform_settings", JSON.stringify(settings));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (e) {
      alert("Failed to save settings.");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Site Settings</h2>
          <p className="text-muted-foreground text-sm mt-1">Configure global store settings, platform fees, and layout preferences.</p>
        </div>
        {savedNotice && (
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-2 animate-fade-in">
            ✓ Settings Saved Successfully
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="admin-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold border-b border-border pb-3">Platform Commissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">Global Platform Fee (%)</label>
              <input 
                type="number" 
                value={platformFee} 
                onChange={(e) => setPlatformFee(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">Payout Threshold ($)</label>
              <input 
                type="number" 
                value={payoutThreshold} 
                onChange={(e) => setPayoutThreshold(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="admin-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold border-b border-border pb-3">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Allow New Seller Signups</h4>
                <p className="text-sm text-muted-foreground">If turned off, new sellers must be manually invited.</p>
              </div>
              <input 
                type="checkbox" 
                checked={allowSellerSignups} 
                onChange={(e) => setAllowSellerSignups(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer" 
              />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <h4 className="font-semibold">Enable Automated Product Approvals</h4>
                <p className="text-sm text-muted-foreground">Approve new uploads instantly without admin review.</p>
              </div>
              <input 
                type="checkbox" 
                checked={autoProductApproval} 
                onChange={(e) => setAutoProductApproval(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
