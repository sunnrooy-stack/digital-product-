"use client";

import React, { useState, useEffect, useRef } from "react";

interface TicketMessage {
  id: string;
  sender: "USER" | "ADMIN" | "SUPPORT";
  senderName: string;
  message: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [adminName, setAdminName] = useState("Support Admin");
  const [actionLoading, setActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch tickets function
  const fetchTickets = async (isBackground = false) => {
    try {
      let res = await fetch(`http://localhost:5000/api/tickets?t=${Date.now()}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`https://digital-product-1-l3qr.onrender.com/api/tickets?t=${Date.now()}`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
          if (!selectedTicketId && data.tickets.length > 0 && !isBackground) {
            setSelectedTicketId(data.tickets[0].id);
          }
        }
      }
    } catch (e) {
      if (!isBackground) console.error("Error fetching tickets:", e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTickets();
  }, []);

  // Real-time polling every 3 seconds for fast, instant live updates without refreshing
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  // Auto scroll messages to bottom on new message or ticket switch
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedTicketId, selectedTicket?.messages?.length]);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.ticketNumber.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Stats calculation
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  // Send Reply
  const handleSendReply = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const text = (customMsg || replyText).trim();
    if (!text || !selectedTicketId) return;

    setSendingReply(true);
    setReplyText("");

    // Optimistic UI update
    const optimisticMessage: TicketMessage = {
      id: `temp_${Date.now()}`,
      sender: "ADMIN",
      senderName: adminName,
      message: text,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            status: t.status === "OPEN" ? "IN_PROGRESS" : t.status,
            messages: [...t.messages, optimisticMessage],
            lastMessageAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    try {
      let res = await fetch(`http://localhost:5000/api/tickets/${selectedTicketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sender: "ADMIN",
          senderName: adminName,
        }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`https://digital-product-1-l3qr.onrender.com/api/tickets/${selectedTicketId}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            sender: "ADMIN",
            senderName: adminName,
          }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data && data.ticket) {
          setTickets((prev) => prev.map((t) => (t.id === selectedTicketId ? data.ticket : t)));
        }
      }
    } catch (err) {
      console.error("Error sending admin reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  // Update Status
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicketId) return;
    setActionLoading(true);
    const targetId = selectedTicketId;

    if (newStatus === "CLOSED") {
      // Auto-remove immediately from queue
      const remaining = tickets.filter((t) => t.id !== targetId);
      setTickets(remaining);
      setSelectedTicketId(remaining.length > 0 ? remaining[0].id : null);

      try {
        await fetch(`http://localhost:5000/api/tickets/${targetId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CLOSED" }),
        }).catch(() => null);

        await fetch(`https://digital-product-1-l3qr.onrender.com/api/tickets/${targetId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CLOSED" }),
        }).catch(() => null);
      } catch (e) {
        console.error("Error closing ticket:", e);
      } finally {
        setActionLoading(false);
      }
      return;
    }

    setTickets((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, status: newStatus as any } : t))
    );

    try {
      let res = await fetch(`http://localhost:5000/api/tickets/${targetId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`https://digital-product-1-l3qr.onrender.com/api/tickets/${targetId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }).catch(() => null);
      }
    } catch (e) {
      console.error("Error updating status:", e);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this support ticket?")) return;

    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    if (selectedTicketId === ticketId) {
      const remaining = tickets.filter((t) => t.id !== ticketId);
      setSelectedTicketId(remaining.length > 0 ? remaining[0].id : null);
    }

    try {
      await fetch(`http://localhost:5000/api/tickets/${ticketId}`, { method: "DELETE" }).catch(() => null);
      await fetch(`https://digital-product-1-l3qr.onrender.com/api/tickets/${ticketId}`, { method: "DELETE" }).catch(() => null);
    } catch (e) {}
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">🔥 URGENT</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">⚡ HIGH</span>;
      case "LOW":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">MEDIUM</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">🟡 OPEN</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">🔵 IN PROGRESS</span>;
      case "RESOLVED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 RESOLVED</span>;
      case "CLOSED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">⚪ CLOSED</span>;
      default:
        return null;
    }
  };

  const cannedReplies = [
    "Hello! I am looking into your request right now.",
    "Your download link has been refreshed. Please check your downloads page.",
    "Payment verification has been completed successfully.",
    "Thank you for contacting us! This issue has been marked as resolved."
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Top Header & Stats ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Support Tickets & Live Desk</h1>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              REALTIME SYNC
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Realtime customer support desk. Messages send and receive automatically without refreshing.
          </p>
        </div>

        <button
          onClick={() => fetchTickets(false)}
          className="self-start sm:self-auto px-4 py-2 bg-muted hover:bg-muted/80 text-xs font-bold rounded-xl border border-border flex items-center gap-2 transition-all"
        >
          <span>🔄</span> Force Refresh
        </button>
      </div>

      {/* ── 4 Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-border/70 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase">Total Tickets</span>
            <p className="text-2xl font-black mt-1 text-foreground">{totalCount}</p>
          </div>
          <span className="text-3xl opacity-80">🎫</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300 font-semibold uppercase">Open (Needs Action)</span>
            <p className="text-2xl font-black mt-1 text-amber-400">{openCount}</p>
          </div>
          <span className="text-3xl opacity-80">🟡</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-300 font-semibold uppercase">In Progress</span>
            <p className="text-2xl font-black mt-1 text-blue-400">{inProgressCount}</p>
          </div>
          <span className="text-3xl opacity-80">🔵</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-semibold uppercase">Resolved</span>
            <p className="text-2xl font-black mt-1 text-emerald-400">{resolvedCount}</p>
          </div>
          <span className="text-3xl opacity-80">🟢</span>
        </div>
      </div>

      {/* ── Main Split View ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* ── Left Column: Ticket List & Search (4 Cols) ── */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-4 border border-border/70 flex flex-col h-full overflow-hidden">
          {/* Search bar */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search by ticket #, user, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background/80 border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
            {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Ticket Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="text-center py-10 text-xs text-muted-foreground">Loading support queue...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground glass-panel rounded-2xl border border-dashed border-border p-6">
                No tickets matching current filters.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = ticket.id === selectedTicketId;
                const lastMsg = ticket.messages[ticket.messages.length - 1];

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative group ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-md shadow-primary/10"
                        : "bg-card/50 hover:bg-muted/40 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-primary">{ticket.ticketNumber}</span>
                      <div className="flex items-center gap-1">
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-foreground line-clamp-1 mb-1">{ticket.subject}</h4>

                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {lastMsg ? `${lastMsg.sender === "ADMIN" ? "You: " : ""}${lastMsg.message}` : ticket.messages[0]?.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 pt-1.5 border-t border-border/50">
                      <span className="font-medium truncate max-w-[120px]">{ticket.name}</span>
                      <span>{new Date(ticket.lastMessageAt || ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Column: Live Conversation & Quick Reply Desk (8 Cols) ── */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-border/70 flex flex-col h-full shadow-2xl overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header Info */}
              <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-foreground">{selectedTicket.subject}</h2>
                    <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-md bg-muted text-primary">
                      {selectedTicket.ticketNumber}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer: <strong className="text-foreground">{selectedTicket.name}</strong> ({selectedTicket.email}) • Category: <strong className="text-foreground">{selectedTicket.category}</strong>
                  </p>
                </div>

                {/* Quick Status Action Controls */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={actionLoading}
                    className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="OPEN">🟡 Open</option>
                    <option value="IN_PROGRESS">🔵 In Progress</option>
                    <option value="RESOLVED">🟢 Resolved</option>
                    <option value="CLOSED">⚪ Closed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 rounded-xl transition-colors text-xs font-bold border border-border"
                    title="Delete Ticket"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 px-2">
                {selectedTicket.messages.map((msg, index) => {
                  const isAdmin = msg.sender === "ADMIN" || msg.sender === "SUPPORT";
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col transition-all ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {isAdmin ? `🛡️ ${msg.senderName || "Support Admin"}` : `👤 ${msg.senderName || selectedTicket.name}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {new Date(msg.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                          isAdmin
                            ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                            : "bg-muted/90 text-foreground border border-border rounded-tl-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Canned Quick Response Chips */}
              <div className="pt-2 pb-2 flex gap-2 overflow-x-auto scrollbar-none border-t border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase self-center whitespace-nowrap">
                  ⚡ Quick:
                </span>
                {cannedReplies.map((canned, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendReply(undefined, canned)}
                    className="text-[11px] bg-muted/70 hover:bg-primary/20 hover:text-primary border border-border px-3 py-1 rounded-full whitespace-nowrap transition-all flex-shrink-0"
                  >
                    {canned}
                  </button>
                ))}
              </div>

              {/* Quick Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your response... (Instant real-time send without refresh)"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-background/90 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
                >
                  {sendingReply ? "Sending..." : "Send Reply"}
                  <span>🚀</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <span className="text-5xl mb-4">💬</span>
              <h3 className="text-lg font-bold text-foreground">No Ticket Selected</h3>
              <p className="text-xs max-w-sm mt-1">
                Select a ticket from the left queue to view the live conversation and send replies without refreshing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
