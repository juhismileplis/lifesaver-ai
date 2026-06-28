"use client";

import React from "react";
import { ChatWindow } from "@/components/companion/ChatWindow";
import { Card, CardContent } from "@/components/ui/Card";
import { useTaskStore } from "@/lib/store";
import { useChatStore } from "@/lib/store";

const quickActions = [
  {
    label: "What should I work on?",
    icon: "🎯",
    color: "bg-brand-50 border-brand-200 hover:bg-brand-100",
  },
  {
    label: "Help me plan my day",
    icon: "📅",
    color: "bg-accent-50 border-accent-200 hover:bg-accent-100",
  },
  {
    label: "I'm feeling overwhelmed",
    icon: "😮‍💨",
    color: "bg-warning-50 border-warning-200 hover:bg-warning-100",
  },
  {
    label: "Break down my tasks",
    icon: "🧩",
    color: "bg-surface-50 border-surface-200 hover:bg-surface-100",
  },
  {
    label: "Am I on track?",
    icon: "📊",
    color: "bg-brand-50 border-brand-200 hover:bg-brand-100",
  },
  {
    label: "Motivate me!",
    icon: "🔥",
    color: "bg-danger-50 border-danger-200 hover:bg-danger-100",
  },
];

export default function CompanionPage() {
  const { addMessage } = useChatStore();
  const { tasks } = useTaskStore();

  const handleQuickAction = (label: string) => {
    // The ChatWindow will handle sending via its own state
    // We dispatch to the chat store
    const inputEl = document.querySelector("textarea");
    if (inputEl) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(inputEl, label);
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">AI Companion</h1>
        <p className="text-surface-400 mt-1">
          Your personal productivity coach — chat, plan, and get things done.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Chat */}
        <div className="lg:col-span-3">
          <ChatWindow />
        </div>

        {/* Quick Actions & Context */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <div className="p-4 border-b border-surface-100">
              <h3 className="font-semibold text-surface-900">Quick Actions</h3>
              <p className="text-xs text-surface-400 mt-0.5">Try these prompts</p>
            </div>
            <div className="p-3 space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${action.color} text-surface-700`}
                >
                  <span className="mr-2">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Task Overview */}
          <Card>
            <div className="p-4 border-b border-surface-100">
              <h3 className="font-semibold text-surface-900">Your Tasks</h3>
              <p className="text-xs text-surface-400 mt-0.5">AI has this context</p>
            </div>
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-sm text-surface-400 text-center py-4">
                  No tasks yet. Add some to get AI assistance!
                </p>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface-50"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      task.priority === "critical" ? "bg-danger-500" :
                      task.priority === "high" ? "bg-warning-500" :
                      task.priority === "medium" ? "bg-brand-500" :
                      "bg-surface-400"
                    }`} />
                    <span className="text-sm text-surface-700 truncate">
                      {task.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
