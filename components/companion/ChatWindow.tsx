"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore, useTaskStore } from "@/lib/store";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/Button";

export function ChatWindow() {
  const { messages, addMessage, isProcessing, setProcessing } = useChatStore();
  const { tasks } = useTaskStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput("");
    addMessage({ role: "user", content: userMessage, type: "text" });
    setProcessing(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: {
            tasks: tasks.map((t) => ({
              id: t.id,
              title: t.title,
              priority: t.priority,
              status: t.status,
              deadline: t.deadline,
              estimatedMinutes: t.estimatedMinutes,
              category: t.category,
            })),
          },
        }),
      });

      const data = await response.json();
      addMessage({
        role: "assistant",
        content: data.reply || "I'm here to help!",
        type: "text",
      });
    } catch (error) {
      addMessage({
        role: "assistant",
        content: "I'm having trouble connecting. Please try again.",
        type: "text",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-surface-200 bg-white shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold shadow-md shadow-accent-200">
          AI
        </div>
        <div>
          <h3 className="font-semibold text-surface-900">LifeSaver AI</h3>
          <p className="text-xs text-surface-400">Always here to help</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-surface-400">
          <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-50/50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isProcessing && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-bold">
              AI
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-surface-200 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-surface-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-surface-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-surface-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-surface-100">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your tasks..."
              rows={1}
              className="w-full rounded-xl border border-surface-300 bg-surface-50 px-4 py-3 pr-12 text-sm text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none resize-none"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            size="md"
            className="h-11 w-11 !p-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
