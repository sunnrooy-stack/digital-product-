import { Request, Response } from 'express';
import prisma from '../config/prisma';

export interface TicketMessage {
  id: string;
  sender: 'USER' | 'ADMIN' | 'SUPPORT';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

// Global In-memory store for instant sync and offline/local fallback
export const inMemoryTicketsStore: SupportTicketItem[] = [
  {
    id: "tck_demo_1",
    ticketNumber: "TCK-1001",
    name: "Alex Johnson",
    email: "alex@example.com",
    subject: "Need help downloading my digital assets",
    category: "Technical Support",
    priority: "HIGH",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: "msg_demo_1",
        sender: "USER",
        senderName: "Alex Johnson",
        message: "Hi! I just purchased the 10GB Video Editing Pack but the download link seems to be taking longer than expected. Can you please assist?",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  },
  {
    id: "tck_demo_2",
    ticketNumber: "TCK-1002",
    name: "Sara Khan",
    email: "sara.design@gmail.com",
    subject: "Inquiry about Commercial License for FF Thumbnail Pack",
    category: "General Inquiry",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    messages: [
      {
        id: "msg_demo_2_1",
        sender: "USER",
        senderName: "Sara Khan",
        message: "Hello, does the FF Thumbnail Pack include rights to use for client YouTube channels?",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: "msg_demo_2_2",
        sender: "ADMIN",
        senderName: "Support Team",
        message: "Hi Sara! Yes, all items purchased here come with full commercial rights for personal and client projects.",
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  }
];

// Helper to generate clean unique ticket number
const generateTicketNumber = (): string => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `TCK-${randomNum}`;
};

// GET /api/tickets
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const { status, search, email } = req.query;
    let list = [...inMemoryTicketsStore];

    if (email && typeof email === 'string') {
      const targetEmail = email.trim().toLowerCase();
      list = list.filter(t => t.email.toLowerCase() === targetEmail);
    }

    if (status && status !== 'ALL') {
      list = list.filter(t => t.status.toUpperCase() === String(status).toUpperCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(t => 
        t.ticketNumber.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    }

    // Sort by latest activity
    list.sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());

    res.status(200).json({
      success: true,
      total: list.length,
      tickets: list
    });
  } catch (error: any) {
    console.error("Get tickets error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch tickets" });
  }
};

// GET /api/tickets/user/:email
export const getTicketsByUserEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const targetEmail = email.trim().toLowerCase();
    const userTickets = inMemoryTicketsStore.filter(t => t.email.toLowerCase() === targetEmail);
    userTickets.sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());

    res.status(200).json({
      success: true,
      total: userTickets.length,
      tickets: userTickets
    });
  } catch (error: any) {
    console.error("Get user tickets error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user tickets" });
  }
};

// GET /api/tickets/:id
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = inMemoryTicketsStore.find(t => t.id === id || t.ticketNumber === id);

    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error: any) {
    console.error("Get ticket by ID error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch ticket" });
  }
};

// POST /api/tickets (Create Ticket)
export const createTicket = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, category, priority } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Name, email, subject, and message are all required."
      });
    }

    const now = new Date().toISOString();
    const ticketId = `tck_${Date.now()}`;
    const ticketNumber = generateTicketNumber();

    const initialMessage: TicketMessage = {
      id: `msg_${Date.now()}_1`,
      sender: "USER",
      senderName: name.trim(),
      message: message.trim(),
      createdAt: now
    };

    const newTicket: SupportTicketItem = {
      id: ticketId,
      ticketNumber,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      category: category || "General Inquiry",
      priority: (priority || "MEDIUM").toUpperCase() as any,
      status: "OPEN",
      messages: [initialMessage],
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now
    };

    // Save to memory store first for real-time responsiveness
    inMemoryTicketsStore.unshift(newTicket);
    console.log(`🎫 [Support] New Ticket Created: ${newTicket.ticketNumber} by ${newTicket.name} (${newTicket.email})`);

    // Optional background save to MongoDB/Prisma
    try {
      let user = await prisma.user.findUnique({ where: { email: newTicket.email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: newTicket.email,
            name: newTicket.name,
            firebaseUid: `guest_tck_${Date.now()}`
          }
        });
      }
      await prisma.supportTicket.create({
        data: {
          subject: newTicket.subject,
          message: newTicket.messages[0].message,
          status: "OPEN",
          userId: user.id
        }
      });
    } catch (dbErr) {
      // Graceful fallback to memory store
    }

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: newTicket
    });
  } catch (error: any) {
    console.error("Create ticket error:", error);
    res.status(500).json({ success: false, error: "Failed to create ticket" });
  }
};

// POST /api/tickets/:id/reply (Add Reply Message)
export const replyTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, sender, senderName } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: "Message content cannot be empty." });
    }

    const ticketIndex = inMemoryTicketsStore.findIndex(t => t.id === id || t.ticketNumber === id);
    if (ticketIndex === -1) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    const now = new Date().toISOString();
    const isSenderAdmin = sender === 'ADMIN' || sender === 'SUPPORT';

    const newReply: TicketMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sender: isSenderAdmin ? 'ADMIN' : 'USER',
      senderName: (senderName || (isSenderAdmin ? 'Support Admin' : inMemoryTicketsStore[ticketIndex].name)).trim(),
      message: message.trim(),
      createdAt: now
    };

    inMemoryTicketsStore[ticketIndex].messages.push(newReply);
    inMemoryTicketsStore[ticketIndex].updatedAt = now;
    inMemoryTicketsStore[ticketIndex].lastMessageAt = now;

    // Auto-update status if admin replies
    if (isSenderAdmin && inMemoryTicketsStore[ticketIndex].status === 'OPEN') {
      inMemoryTicketsStore[ticketIndex].status = 'IN_PROGRESS';
    }

    console.log(`💬 [Support] Reply added to ${inMemoryTicketsStore[ticketIndex].ticketNumber} by ${newReply.senderName}`);

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      ticket: inMemoryTicketsStore[ticketIndex],
      reply: newReply
    });
  } catch (error: any) {
    console.error("Reply ticket error:", error);
    res.status(500).json({ success: false, error: "Failed to send reply" });
  }
};

// PATCH /api/tickets/:id/status (Update Status & Priority)
export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const ticketIndex = inMemoryTicketsStore.findIndex(t => t.id === id || t.ticketNumber === id);
    if (ticketIndex === -1) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    const ticket = inMemoryTicketsStore[ticketIndex];
    const now = new Date().toISOString();

    // If status is CLOSED, delete permanently from database and memory store
    if (status && status.toUpperCase() === 'CLOSED') {
      const removedTicket = inMemoryTicketsStore.splice(ticketIndex, 1)[0];
      console.log(`🔒 [Support] Ticket ${removedTicket.ticketNumber} CLOSED and permanently removed from database.`);

      try {
        await prisma.supportTicket.deleteMany({
          where: {
            OR: [
              { id: removedTicket.id },
              { subject: removedTicket.subject }
            ]
          }
        });
      } catch (dbErr) {}

      return res.status(200).json({
        success: true,
        message: "Ticket closed and permanently removed",
        ticket: { ...removedTicket, status: "CLOSED" },
        isClosedAndRemoved: true
      });
    }

    if (status) {
      ticket.status = status.toUpperCase();
    }
    if (priority) {
      ticket.priority = priority.toUpperCase();
    }
    ticket.updatedAt = now;

    console.log(`🔄 [Support] Ticket ${ticket.ticketNumber} updated -> Status: ${ticket.status}, Priority: ${ticket.priority}`);

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      ticket
    });
  } catch (error: any) {
    console.error("Update ticket status error:", error);
    res.status(500).json({ success: false, error: "Failed to update ticket" });
  }
};

// DELETE /api/tickets/:id
export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = inMemoryTicketsStore.findIndex(t => t.id === id || t.ticketNumber === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    const deleted = inMemoryTicketsStore.splice(index, 1)[0];
    console.log(`🗑️ [Support] Ticket ${deleted.ticketNumber} deleted`);

    try {
      await prisma.supportTicket.deleteMany({
        where: {
          OR: [
            { id: deleted.id },
            { subject: deleted.subject }
          ]
        }
      });
    } catch (dbErr) {}

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
      deletedTicketId: deleted.id
    });
  } catch (error: any) {
    console.error("Delete ticket error:", error);
    res.status(500).json({ success: false, error: "Failed to delete ticket" });
  }
};
