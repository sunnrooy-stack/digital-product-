"use client";

import React, { useState, useEffect } from "react";

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/users")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch(err => console.error("Failed to load users:", err));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Users Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage user accounts, purchase activity, and account status.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          + Add User
        </button>
      </div>

      <div className="admin-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-sm font-semibold text-muted-foreground">User</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Total Purchases</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Total Spent</th>
              <th className="p-4 text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    user.status === "Active" 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : user.status === "Suspended" 
                      ? "bg-rose-500/10 text-rose-500" 
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 font-medium">{user.purchases} orders</td>
                <td className="p-4 font-bold text-primary">{user.spent}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-muted hover:bg-muted/80 text-xs font-semibold rounded transition-colors">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold rounded transition-colors">
                      Suspend
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
