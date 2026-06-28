"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0",
          isUser
            ? "bg-gradient-to-br from-brand-400 to-brand-600 text-white"
            : "bg-gradient-to-br from-accent-400 to-accent-600 text-white"
        )}
      >
        {isUser ? "U" : "LS"}
      </div>

      {/* Message bubble */}
      <div className={cn("max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-brand-500 text-white rounded-tr-md"
              : "bg-white border border-surface-200 shadow-sm rounded-tl-md",
            message.type === "alert" && "border-warning-200 bg-warning-50",
            message.type === "insight" && "border-brand-200 bg-brand-50"
          )}
        >
          {message.content}
        </div>
        <p className={cn(
          "text-xs text-surface-400 mt-1",
          isUser ? "text-right" : "text-left"
        )}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
