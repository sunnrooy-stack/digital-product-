"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "General Inquiry",
    priority: "MEDIUM",
    message: "",
  });

  const [userEmail, setUserEmail] = useState<string>("");
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [loadingUserTickets, setLoadingUserTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
    }
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Auto scroll chat to bottom when messages update or ticket opens
  useEffect(() => {
    if (activeTicket) {
      const timer = setTimeout(() => {
        scrollToBottom(true);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [activeTicket?.messages?.length, activeTicket?.id]);

  // Load user email and auto-restore tickets upon refresh
  useEffect(() => {
    try {
      let email = "";
      let name = "";

      const verified = localStorage.getItem("verified_user");
      if (verified) {
        const parsed = JSON.parse(verified);
        if (parsed && parsed.email) {
          email = parsed.email.toLowerCase();
          name = parsed.name || "";
        }
      }

      if (!email) {
        email = (localStorage.getItem("user_contact_email") || "").toLowerCase();
        name = localStorage.getItem("user_contact_name") || "";
      }

      if (email) {
        setUserEmail(email);
        setFormData((prev) => ({
          ...prev,
          email,
          name: name || prev.name,
        }));
        fetchUserTickets(email);
      }
    } catch (e) {}
  }, []);

  // Real-time polling for active ticket & user tickets (every 3s without refresh)
  useEffect(() => {
    if (!userEmail && !activeTicket) return;

    const interval = setInterval(() => {
      if (userEmail) {
        fetchUserTickets(userEmail, true);
      } else if (activeTicket) {
        fetchTicketById(activeTicket.id, true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userEmail, activeTicket?.id]);

  // Fetch all tickets attached to user's email from Database
  const fetchUserTickets = async (email: string, isPolling = false) => {
    if (!email) return;
    if (!isPolling) setLoadingUserTickets(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      let res = await fetch(`http://localhost:5000/api/tickets?email=${encodeURIComponent(cleanEmail)}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`https://digital-product-1-l3qr.onrender.com/api/tickets?email=${encodeURIComponent(cleanEmail)}`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.tickets)) {
          setUserTickets(data.tickets);

          // If no ticket is currently selected or if active ticket exists, update it with fresh data
          setActiveTicket((currentActive) => {
            if (currentActive) {
              const fresh = data.tickets.find((t: SupportTicket) => t.id === currentActive.id);
              if (fresh) return fresh;
              // If ticket was deleted or closed
              return { ...currentActive, status: "CLOSED" };
            }
            // Auto-select latest open ticket if available upon page load
            if (data.tickets.length > 0) {
              const savedId = localStorage.getItem("last_active_ticket_id");
              const target = data.tickets.find((t: SupportTicket) => t.id === savedId) || data.tickets[0];
              return target;
            }
            return null;
          });
        }
      }
    } catch (e) {
      if (!isPolling) console.error("Error fetching user tickets:", e);
    } finally {
      if (!isPolling) setLoadingUserTickets(false);
    }
  };

  const fetchTicketById = async (ticketId: string, isPolling = false) => {
    try {
      let res = await fetch(`http://localhost:5000/api/tickets/${ticketId}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`https://digital-product-1-l3qr.onrender.com/api/tickets/${ticketId}`).catch(() => null);
      }

      if (res && res.status === 404) {
        setActiveTicket((prev) => (prev ? { ...prev, status: "CLOSED" } : null));
        return;
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data && data.ticket) {
          setActiveTicket(data.ticket);
        }
      }
    } catch (e) {
      if (!isPolling) console.error("Error fetching ticket:", e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setNotification("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setNotification(null);

    const emailToSave = formData.email.trim().toLowerCase();

    try {
      // Save user email to localStorage so tickets persist permanently across refreshes
      localStorage.setItem("user_contact_email", emailToSave);
      localStorage.setItem("user_contact_name", formData.name.trim());
      setUserEmail(emailToSave);

      let res = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, email: emailToSave }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch("https://digital-product-1-l3qr.onrender.com/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, email: emailToSave }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        const result = await res.json();
        if (result.success && result.ticket) {
          setActiveTicket(result.ticket);
          setUserTickets((prev) => [result.ticket, ...prev.filter((t) => t.id !== result.ticket.id)]);
          localStorage.setItem("last_active_ticket_id", result.ticket.id);
          setFormData((prev) => ({
            ...prev,
            subject: "",
            message: "",
          }));
        }
      }
    } catch (err: any) {
      console.error("Ticket submission error:", err);
      setNotification("Failed to submit ticket. Please check your network.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;

    setSendingReply(true);
    const text = replyMessage.trim();
    setReplyMessage("");

    // Optimistic UI update
    const optimisticMessage: TicketMessage = {
      id: `temp_${Date.now()}`,
      sender: "USER",
      senderName: activeTicket.name,
      message: text,
      createdAt: new Date().toISOString(),
    };

    setActiveTicket((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, optimisticMessage],
        lastMessageAt: new Date().toISOString(),
      };
    });

    try {
      let res = await fetch(`http://localhost:5000/api/tickets/${activeTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sender: "USER",
          senderName: activeTicket.name,
        }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`https://digital-product-1-l3qr.onrender.com/api/tickets/${activeTicket.id}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            sender: "USER",
            senderName: activeTicket.name,
          }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.ticket) {
          setActiveTicket(data.ticket);
        }
      }
    } catch (e) {
      console.error("Error sending reply:", e);
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Open
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen max-w-6xl py-16 px-4 sm:px-6 lg:px-8 mx-auto">
      {/* ── Header ── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          ⚡ 24/7 Live Support Helpdesk
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
          {activeTicket ? "Live Support Ticket Desk" : "Get in Touch & Raise Ticket"}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          {activeTicket
            ? "Your ticket is linked to your email and saved in database. Messages send and receive automatically without refreshing."
            : "Have questions or need assistance? Fill in the details to generate an instant ticket attached to your email."}
        </p>

        {/* ── User Tickets Selector Bar (When user has tickets saved in database) ── */}
        {userTickets.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 p-2 bg-muted/30 border border-border/70 rounded-2xl max-w-3xl mx-auto">
            <span className="text-xs font-bold text-muted-foreground px-2">My Tickets ({userTickets.length}):</span>
            {userTickets.map((t) => {
              const isSelected = activeTicket?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTicket(t);
                    localStorage.setItem("last_active_ticket_id", t.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card hover:bg-muted text-muted-foreground border border-border hover:text-foreground"
                  }`}
                >
                  <span>{t.ticketNumber}</span>
                  <span className="text-[10px] opacity-80">({t.status})</span>
                </button>
              );
            })}
            <button
              onClick={() => setActiveTicket(null)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                !activeTicket
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 hover:bg-primary/20 text-muted-foreground hover:text-primary border border-dashed border-border"
              }`}
            >
              <span>➕ New Ticket</span>
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTicket ? (
          /* ── Real-time Active Ticket & Live Chat View ── */
          <motion.div
            key="ticket-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left: Ticket Summary Sidebar */}
            <div className="glass-panel rounded-3xl p-6 border border-border/70 flex flex-col justify-between h-fit lg:sticky lg:top-24 space-y-6">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <span className="text-xs text-muted-foreground font-mono">TICKET ID</span>
                    <h3 className="text-xl font-mono font-black text-primary">{activeTicket.ticketNumber}</h3>
                  </div>
                  <div>{getStatusBadge(activeTicket.status)}</div>
                </div>

                <div className="space-y-4 pt-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Subject</span>
                    <p className="font-semibold text-foreground mt-0.5">{activeTicket.subject}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground block">Category</span>
                      <p className="font-medium text-foreground text-xs mt-0.5 px-2.5 py-1 bg-muted/50 rounded-lg border border-border/50 inline-block">
                        {activeTicket.category}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Priority</span>
                      <p className="font-bold text-xs mt-0.5 text-rose-400 px-2.5 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20 inline-block">
                        {activeTicket.priority}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground block">Account / Email</span>
                    <p className="font-semibold text-foreground text-xs mt-0.5">{activeTicket.name} ({activeTicket.email})</p>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground block">Created At</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(activeTicket.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Saved in database • Realtime sync active
                </div>

                <button
                  onClick={() => setActiveTicket(null)}
                  className="w-full py-2.5 px-4 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  ➕ Raise Another Ticket
                </button>
              </div>
            </div>

            {/* Right: Live Chat Messages Box */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-border/70 flex flex-col h-[650px] shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
                    💬
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Live Conversation Thread</h3>
                    <p className="text-xs text-muted-foreground">Admin answers will appear here in real-time without refresh</p>
                  </div>
                </div>
                <span className="text-xs bg-muted px-3 py-1 rounded-full font-mono text-muted-foreground">
                  {activeTicket.messages.length} messages
                </span>
              </div>

              {/* Message History List */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto py-4 space-y-4 px-2 scroll-smooth">
                {activeTicket.messages.map((msg, index) => {
                  const isUser = msg.sender === "USER";
                  return (
                    <motion.div
                      key={msg.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {isUser ? "You" : `🛡️ ${msg.senderName || "Support Specialist"}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                            : "bg-muted/90 text-foreground border border-border/80 rounded-tl-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Reply Form or Closed State */}
              {activeTicket.status === "CLOSED" ? (
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/30 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span>🔒</span>
                    <span>This support ticket has been closed and removed.</span>
                  </div>
                  <button
                    onClick={() => setActiveTicket(null)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20"
                  >
                    ➕ Start New Conversation
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="pt-4 border-t border-border flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message without refreshing..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 bg-background/80 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyMessage.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-3 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {sendingReply ? "Sending..." : "Send"}
                    <span>🚀</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        ) : (
          /* ── Standard Contact Form ── */
          <motion.div
            key="contact-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* ── Left: Contact & Ticket Creation Form ── */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-8 border border-border/70 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Raise a Support Ticket</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Tickets are saved in database and linked to your email</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl">
                  🎫
                </div>
              </div>

              {notification && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                  {notification}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                      Email Address (Tickets Attached Here) *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => {
                        if (formData.email) fetchUserTickets(formData.email);
                      }}
                      required
                      className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {/* Category & Priority Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="category" className="text-xs font-semibold text-muted-foreground">
                      Issue Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="Technical Support">🛠️ Technical Support</option>
                      <option value="Order & Downloads">📦 Order & Downloads</option>
                      <option value="Billing & Payment">💳 Billing & Payment</option>
                      <option value="General Inquiry">💡 General Inquiry</option>
                      <option value="Bug Report">🐛 Bug Report</option>
                      <option value="Partnership">🤝 Partnership</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="priority" className="text-xs font-semibold text-muted-foreground">
                      Priority Level
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="LOW">🟢 Low</option>
                      <option value="MEDIUM">🟡 Medium (Standard)</option>
                      <option value="HIGH">🟠 High</option>
                      <option value="URGENT">🔴 Urgent (Immediate Help)</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="text-xs font-semibold text-muted-foreground">
                    Subject / Title *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Brief description of your issue or request"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-muted-foreground">
                    Message Details *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Explain your question or problem in detail..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary py-3.5 text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <span>Submit & Raise Ticket</span>
                      <span>🚀</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* ── Right: Support Info Cards ── */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="glass-panel rounded-3xl p-6 border border-border/70 flex items-start gap-4 hover:border-primary/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl flex-shrink-0">
                  ⚡
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Email-Linked Persistence</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    All your support tickets and messages are attached to your email. You can refresh or revisit anytime without losing messages.
                  </p>
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-6 border border-border/70 flex items-start gap-4 hover:border-primary/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 text-2xl flex-shrink-0">
                  📧
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Email Support</h3>
                  <p className="text-primary font-medium text-xs mt-1">support@premiumdigital.store</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Average response under 1 hour</p>
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-6 border border-border/70 flex items-start gap-4 hover:border-primary/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl flex-shrink-0">
                  🌐
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Real-Time Messaging</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct conversation desk. No page reload required to send or receive messages.
                  </p>
                </div>
              </div>

              {/* Info banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-purple-600/5 to-transparent border border-primary/20 flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your ticket history is stored in database and accessible through your email.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
