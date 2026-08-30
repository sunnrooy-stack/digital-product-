"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hi! I am your AI assistant. Need help finding a premium digital product?' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput("");
    setIsLoading(true);
    
    try {
      const response = await fetch('https://digital-product-1-l3qr.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', text: userMessage }] })
      });
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Have you configured your GEMINI_API_KEY?' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am offline right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center text-2xl hover:scale-110 transition-transform z-50"
      >
        ✨
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-card border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="h-16 bg-primary px-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="font-bold">AI Support</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-muted text-foreground rounded-bl-none border border-border'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-muted text-foreground rounded-bl-none border border-border flex items-center gap-2">
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-card border-t border-border shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..." 
                  disabled={isLoading}
                  className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  ↑
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
