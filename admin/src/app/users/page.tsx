"use client";

import React, { useState, useEffect } from "react";

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const fetchUsers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://digital-product-1-l3qr.onrender.com";
      const res = await fetch(`${apiUrl}/api/users`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const intervalId = setInterval(() => {
      fetchUsers();
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const getRoleIcon = (role?: string) => {
    if (!role) return "👤";
    const r = role.toLowerCase();
    if (r.includes("freelancer")) return "🎨";
    if (r.includes("creator")) return "📹";
    if (r.includes("editor")) return "✂️";
    if (r.includes("developer") || r.includes("deployer")) return "💻";
    return "💼";
  };

  // Filter users by search and professional role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === "ALL" ||
      (u.professionalRole && u.professionalRole.toUpperCase() === roleFilter.toUpperCase());

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Users Management</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time backend database for registered users, Date of Birth (DOB), Professional Roles, and activity history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 border border-border/80 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "Freelancer", "Content Creator", "Editor", "Developer"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === role
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background border border-border text-muted-foreground hover:border-border/80"
              }`}
            >
              {role === "ALL" ? "All Users" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="admin-panel rounded-2xl overflow-hidden border border-border shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User Identity</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Role</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth (DOB)</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Orders</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Spent</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
                  Loading user data from backend...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
                  No users found matching filter.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const orderList = Array.isArray(user.orders) ? user.orders : [];
                const orderCount = orderList.length;
                const totalSpent = orderList.reduce((acc: number, o: any) => acc + (Number(o.totalAmount) || 0), 0);
                const roleName = user.professionalRole || "Freelancer";
                const isVerified = user.isVerified !== false;

                return (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    
                    {/* User Identity */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center text-sm uppercase shrink-0 border border-primary/30">
                          {(user.name || "U")[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-foreground truncate flex items-center gap-1.5">
                            <span>{user.name || "Customer User"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{user.email || "-"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Professional Role */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        <span>{getRoleIcon(roleName)}</span>
                        <span>{roleName}</span>
                      </span>
                    </td>

                    {/* Date of Birth */}
                    <td className="p-4 font-mono text-xs font-semibold text-foreground">
                      {user.dateOfBirth || "N/A"}
                    </td>

                    {/* Verification Status */}
                    <td className="p-4">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ⌛ Pending
                        </span>
                      )}
                    </td>

                    {/* Total Orders */}
                    <td className="p-4 font-bold text-sm text-foreground">
                      {orderCount} {orderCount === 1 ? "order" : "orders"}
                    </td>

                    {/* Total Spent */}
                    <td className="p-4 font-black text-sm text-primary">
                      {totalSpent <= 0 ? "₹0.00 (Free)" : `₹${totalSpent.toFixed(2)}`}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                          Details
                        </button>
                      </div>
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
