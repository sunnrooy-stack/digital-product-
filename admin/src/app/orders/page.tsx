"use client";

import React, { useState, useEffect } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          fetch("https://digital-product-1-l3qr.onrender.com/api/orders")
            .then((r) => r.json())
            .then((remoteData) => { if (Array.isArray(remoteData)) setOrders(remoteData); })
            .catch(() => {});
        }
      })
      .catch(() => {
        fetch("https://digital-product-1-l3qr.onrender.com/api/orders")
          .then((r) => r.json())
          .then((remoteData) => { if (Array.isArray(remoteData)) setOrders(remoteData); })
          .catch(() => {});
      });
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
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No storefront orders recorded yet in the database.
                </td>
              </tr>
            ) : (
              orders.map((ord: any) => {
                const orderIdStr = ord.orderNumber || ord.paymentId || ord.id;
                const customerStr = ord.user?.name || ord.user?.email || ord.customer || "Guest";
                const productList = Array.isArray(ord.items)
                  ? ord.items.map((i: any) => i.product?.title || "Digital Product").join(", ")
                  : ord.product || "Digital Product";
                const amountStr = ord.totalAmount <= 0 ? "FREE" : `₹${Number(ord.totalAmount || 0).toFixed(2)}`;
                const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : (ord.date || "-");
                const statusStr = ord.status || "COMPLETED";

                return (
                  <tr key={ord.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold">{orderIdStr}</td>
                    <td className="p-4 font-medium">{customerStr}</td>
                    <td className="p-4 text-xs text-muted-foreground max-w-xs truncate">{productList}</td>
                    <td className="p-4 font-bold text-primary">{amountStr}</td>
                    <td className="p-4 text-xs text-muted-foreground">{dateStr}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        statusStr === "COMPLETED" || statusStr === "Completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : statusStr === "Refunded"
                          ? "bg-muted text-muted-foreground"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}>
                        {statusStr}
                      </span>
                    </td>
                    <td className="p-4">
                      {statusStr === "Refund Requested" ? (
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded hover:bg-rose-700 transition-colors">
                            Approve Refund
                          </button>
                          <button className="px-3 py-1 bg-muted hover:bg-muted/80 text-xs font-semibold rounded transition-colors">
                            Decline
                          </button>
                        </div>
                      ) : (
                        <button className="px-3 py-1 bg-muted hover:bg-muted/80 text-xs font-semibold rounded transition-colors">
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
