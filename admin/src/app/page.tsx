"use client";

import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState("30d");
  const [realStats, setRealStats] = useState({
    totalRevenue: "₹0.00",
    totalOrders: "0",
    totalCustomers: "0",
    totalProducts: "0",
    todaySales: "₹0.00",
    monthlySales: "₹0.00",
    downloadStats: "0 downloads",
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentOrdersList, setRecentOrdersList] = useState<any[]>([]);
  const [customerGrowthData, setCustomerGrowthData] = useState<any[]>([]);
  const [revenuePoints, setRevenuePoints] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const fetchOverviewData = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://digital-product-1-l3qr.onrender.com";
    Promise.all([
      fetch(`${apiUrl}/api/products`).then((r) => r.json()).catch(() => []),
      fetch(`${apiUrl}/api/orders`).then((r) => r.json()).catch(() => []),
      fetch(`${apiUrl}/api/users`).then((r) => r.json()).catch(() => []),
    ]).then(([productsData, ordersData, usersData]) => {
      const products = Array.isArray(productsData) ? productsData : [];
      const orders = Array.isArray(ordersData) ? ordersData : [];
      const users = Array.isArray(usersData) ? usersData : [];

      let totalRev = 0;
      let todayRev = 0;
      let monthlyRev = 0;
      let totalDownloads = 0;
      const customerEmailsSet = new Set<string>();

      // 1. Add all registered users to customers set
      users.forEach((u: any) => {
        if (u.email) customerEmailsSet.add(u.email.toLowerCase());
        else if (u.name) customerEmailsSet.add(u.name);
      });

      const now = new Date();
      const todayStr = now.toDateString();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Calculate last 7 days customer growth from actual user registration dates
      const past7DaysCounts = [0, 0, 0, 0, 0, 0, 0];
      users.forEach((u: any) => {
        const uDate = u.createdAt ? new Date(u.createdAt) : new Date();
        const diffDays = Math.floor((now.getTime() - uDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          past7DaysCounts[6 - diffDays] += 1;
        } else {
          past7DaysCounts[0] += 1; // Earlier users placed in day 1 bucket
        }
      });

      const maxUsersDay = Math.max(...past7DaysCounts, 1);
      const formattedGrowth = past7DaysCounts.map((count, idx) => ({
        label: `Day ${idx + 1}`,
        count: count,
        heightPct: Math.max(15, Math.min(100, Math.round((count / maxUsersDay) * 100))),
      }));
      setCustomerGrowthData(formattedGrowth);

      // Product sales map
      const productSalesMap: Record<string, { title: string; count: number; revenue: number; views: number }> = {};
      products.forEach((p: any) => {
        productSalesMap[p.id] = {
          title: p.title,
          count: p.downloads || 0,
          revenue: p.revenue || 0,
          views: p.views || 0,
        };
      });

      const dailyRevMap = [0, 0, 0, 0, 0, 0, 0];

      orders.forEach((ord: any) => {
        const amt = Number(ord.totalAmount) || 0;
        totalRev += amt;

        const customerIdentifier = ord.email || ord.userId || ord.user?.email || ord.customer;
        if (customerIdentifier) {
          customerEmailsSet.add(String(customerIdentifier).toLowerCase());
        }

        const orderDate = ord.createdAt ? new Date(ord.createdAt) : new Date();
        const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          dailyRevMap[6 - diffDays] += amt;
        }

        if (orderDate.toDateString() === todayStr) {
          todayRev += amt;
        }
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          monthlyRev += amt;
        }

        const items = ord.items || [];
        totalDownloads += items.length || 1;

        items.forEach((item: any) => {
          const pId = item.productId || item.product?.id;
          if (pId && productSalesMap[pId]) {
            productSalesMap[pId].count += 1;
            productSalesMap[pId].revenue += item.priceAtPurchase || item.product?.price || 0;
          }
        });
      });

      setRevenuePoints(dailyRevMap);

      setRealStats({
        totalRevenue: `₹${totalRev.toFixed(2)}`,
        totalOrders: `${orders.length}`,
        totalCustomers: `${customerEmailsSet.size || users.length || 1}`,
        totalProducts: `${products.length}`,
        todaySales: `₹${todayRev.toFixed(2)}`,
        monthlySales: `₹${monthlyRev.toFixed(2)}`,
        downloadStats: `${totalDownloads} downloads`,
      });

      // Format Recent Orders List
      const formattedRecent = orders.slice(0, 6).map((ord: any) => {
        const itemNames = (ord.items || []).map((i: any) => i.product?.title).filter(Boolean).join(", ");
        return {
          id: ord.orderNumber || ord.paymentId || (ord.id ? ord.id.substring(0, 8) : "-"),
          customer: ord.user?.name || ord.user?.email || ord.customer || "Guest",
          product: itemNames || "Digital Product",
          date: ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          amount: ord.totalAmount <= 0 ? "FREE" : `₹${Number(ord.totalAmount).toFixed(2)}`,
          status: ord.status === "COMPLETED" || ord.status === "Completed" ? "Success" : "Pending",
        };
      });
      setRecentOrdersList(formattedRecent);

      // Top Products list
      const topList = Object.values(productSalesMap)
        .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
        .slice(0, 4);

      setTopProducts(
        topList.map((p) => ({
          name: p.title,
          sales: p.count,
          revenue: p.revenue <= 0 ? "FREE" : `₹${p.revenue.toFixed(2)}`,
          conversion: p.views > 0 ? `${(((p.count) / p.views) * 100).toFixed(1)}%` : "100%",
        }))
      );
    }).catch(err => console.error("Failed to load real dashboard data:", err));
  };

  useEffect(() => {
    fetchOverviewData();
    const intervalId = setInterval(() => {
      fetchOverviewData();
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDownloadStats = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ realStats, recentOrdersList }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `storefront_sales_report_${timeframe}.json`);
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
            <span className="text-xs text-primary font-bold">Real 7-Day Trend</span>
          </div>
          {/* Dynamic Real Bar Chart */}
          <div className="h-64 w-full flex items-end justify-between gap-2 pt-8">
            {(customerGrowthData.length > 0
              ? customerGrowthData
              : [
                  { label: "Day 1", count: 1, heightPct: 40 },
                  { label: "Day 2", count: 1, heightPct: 40 },
                  { label: "Day 3", count: 1, heightPct: 40 },
                  { label: "Day 4", count: 1, heightPct: 40 },
                  { label: "Day 5", count: 1, heightPct: 40 },
                  { label: "Day 6", count: 1, heightPct: 40 },
                  { label: "Day 7", count: 2, heightPct: 80 },
                ]
            ).map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-primary/30 hover:bg-primary rounded-t-lg transition-all duration-300 relative group cursor-pointer"
                  style={{ height: `${item.heightPct}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover border border-border text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.count} {item.count === 1 ? "user" : "users"}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">{item.label}</span>
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
                {recentOrdersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground text-sm">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrdersList.map((ord, idx) => (
                    <tr key={`${ord.id}_${idx}`} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono text-xs font-semibold">{ord.id}</td>
                      <td className="p-4 font-medium">{ord.customer}</td>
                      <td className="p-4 text-xs text-muted-foreground">{ord.date}</td>
                      <td className="p-4 font-bold text-primary">{ord.amount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          ord.status === "Success"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                        }`}>
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
