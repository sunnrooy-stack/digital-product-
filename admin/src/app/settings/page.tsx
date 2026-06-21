import React from "react";

export default function AdminSettings() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Site Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Configure global store settings, platform fees, and layout preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="admin-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold border-b border-border pb-3">Platform Commissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">Global Platform Fee (%)</label>
              <input 
                type="number" 
                defaultValue="5" 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">Payout Threshold ($)</label>
              <input 
                type="number" 
                defaultValue="50" 
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
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <h4 className="font-semibold">Enable Automated Product Approvals</h4>
                <p className="text-sm text-muted-foreground">Approve new uploads instantly without admin review.</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-primary" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
