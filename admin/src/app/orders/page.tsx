"use client";

import React, { useState, useEffect } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/orders")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch(err => console.error("Failed to load orders:", err));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Orders & Refunds</h2>
        <p className="text-muted-foreground text-sm mt-1">Track payments, purchase history, and handle refund requests.</p>
      </div>

      <div className="admin-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-sm font-semibold text-muted-foreground">Order ID</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Customer</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Product</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Amount</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Date</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <tr key={ord.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 font-semibold">{ord.id}</td>
                <td className="p-4">{ord.customer}</td>
                <td className="p-4 text-muted-foreground">{ord.product}</td>
                <td className="p-4 font-bold text-primary">{ord.amount}</td>
                <td className="p-4 text-sm text-muted-foreground">{ord.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    ord.status === "Completed"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : ord.status === "Refunded"
                      ? "bg-muted text-muted-foreground"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {ord.status}
                  </span>
                </td>
                <td className="p-4">
                  {ord.status === "Refund Requested" && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded hover:bg-rose-700 transition-colors">
                        Approve Refund
                      </button>
                      <button className="px-3 py-1 bg-muted hover:bg-muted/80 text-xs font-semibold rounded transition-colors">
                        Decline
                      </button>
                    </div>
                  )}
                  {ord.status !== "Refund Requested" && (
                    <button className="px-3 py-1 bg-muted hover:bg-muted/80 text-xs font-semibold rounded transition-colors">
                      View Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
