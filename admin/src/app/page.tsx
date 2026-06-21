"use client";

import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState("30d");
  const [realStats, setRealStats] = useState({
    totalRevenue: "$0.00",
    totalOrders: "0",
    totalCustomers: "0",
    totalProducts: "0",
    todaySales: "$0.00",
    monthlySales: "$0.00",
    downloadStats: "0 downloads",
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://digital-product-store-l9r1.onrender.com/api/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          let revenue = 0;
          let downloads = 0;
          
          data.forEach(p => {
            revenue += (p.revenue || 0);
            downloads += (p.downloads || 0);
          });

          setRealStats({
            totalRevenue: `$${revenue.toFixed(2)}`,
            totalOrders: `${downloads}`, // Using downloads as a proxy for orders
            totalCustomers: `${Math.floor(downloads * 0.8)}`, // Rough estimate
            totalProducts: `${data.length}`,
            todaySales: `$0.00`, 
            monthlySales: `$${revenue.toFixed(2)}`,
            downloadStats: `${downloads} downloads`,
          });

          // Sort for top products
          const sorted = [...data].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 4);
          setTopProducts(sorted.map(p => ({
            name: p.title,
            sales: p.downloads || 0,
            revenue: `$${(p.revenue || 0).toFixed(2)}`,
            conversion: p.views > 0 ? `${(((p.downloads || 0) / p.views) * 100).toFixed(1)}%` : "0%"
          })));
        }
      })
      .catch(err => console.error("Failed to load dashboard stats:", err));
  }, []);

  const recentOrders = [
    { id: "-", customer: "No recent orders", date: "-", amount: "-", status: "Pending" },
  ];

  // Action for downloading stats
  const handleDownloadStats = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(realStats, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `platform_stats_${timeframe}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm mt-1">Real-time statistics, growth indicators, and download history.</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <button
            onClick={handleDownloadStats}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            📥 Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="admin-panel p-6 rounded-2xl border-l-4 border-l-primary">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-2 text-primary">{realStats.totalRevenue}</p>
        </div>
        <div className="admin-panel p-6 rounded-2xl">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-2">{realStats.totalOrders}</p>
        </div>
        <div className="admin-panel p-6 rounded-2xl">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Customers</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-2 text-emerald-500">{realStats.totalCustomers}</p>
        </div>
        <div className="admin-panel p-6 rounded-2xl">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Products</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-2">{realStats.totalProducts}</p>
        </div>
        <div className="admin-panel p-6 rounded-2xl border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today's Sales</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-2 text-emerald-400">{realStats.todaySales}</p>
        </div>
        <div className="admin-panel p-6 rounded-2xl">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Sales</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-2">{realStats.monthlySales}</p>
        </div>
        <div className="admin-panel p-6 rounded-2xl lg:col-span-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Download Statistics</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-2 text-cyan-400">{realStats.downloadStats}</p>
        </div>
      </div>

      {/* Revenue & Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="admin-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Revenue Trend ({timeframe})</h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded">+18.4% Growth</span>
          </div>
          {/* Custom SVG line chart for sleek dark mode aesthetics */}
          <div className="h-64 w-full">
            <svg viewBox="0 0 500 200" className="w-full h-full text-primary">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="5,5" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="5,5" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="5,5" />

              {/* Area Under Curve */}
              <path
                d="M 0 170 C 50 140, 100 150, 150 110 C 200 70, 250 90, 300 60 C 350 30, 400 50, 500 20 L 500 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />
              {/* Curve Line */}
              <path
                d="M 0 170 C 50 140, 100 150, 150 110 C 200 70, 250 90, 300 60 C 350 30, 400 50, 500 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              {/* Data points */}
              <circle cx="150" cy="110" r="4" fill="currentColor" />
              <circle cx="300" cy="60" r="4" fill="currentColor" />
              <circle cx="500" cy="20" r="4" fill="currentColor" />
            </svg>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pt-2">
            <span>Start</span>
            <span>Middle</span>
            <span>Current</span>
          </div>
        </div>

        {/* Customer Growth Chart */}
        <div className="admin-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Customer Growth</h3>
            <span className="text-xs text-primary font-bold">+12% vs last month</span>
          </div>
          {/* Custom SVG Bar Chart */}
          <div className="h-64 w-full flex items-end justify-between gap-2 pt-8">
            {[40, 60, 45, 80, 55, 90, 95].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-primary/20 hover:bg-primary rounded-t-lg transition-all duration-300 relative group"
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover border border-border text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {val * 10} new
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">Day {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold">Recent Orders</h3>
          <div className="admin-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Order ID</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Customer</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Date</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Amount</th>
                  <th className="p-4 text-sm font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-semibold">{ord.id}</td>
                    <td className="p-4">{ord.customer}</td>
                    <td className="p-4 text-muted-foreground">{ord.date}</td>
                    <td className="p-4 font-bold text-primary">{ord.amount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        ord.status === "Success"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-rose-500/10 text-rose-500"
                      }`}>
                        {ord.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Top Products</h3>
          <div className="admin-panel p-6 rounded-2xl space-y-6">
            {topProducts.map((prod, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold truncate max-w-[180px]">{prod.name}</span>
                  <span className="font-bold text-primary">{prod.revenue}</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full" 
                    style={{ width: `${(prod.sales / 500) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{prod.sales} sales</span>
                  <span>{prod.conversion} conv. rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
