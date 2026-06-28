"use client";

import React, { useMemo, useState } from "react";
import { useRescueStore, useTaskStore } from "@/lib/store";
import { cn, isOverdue, isUrgent } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { RescueTimer } from "@/components/rescue/RescueTimer";
import { Badge } from "@/components/ui/Badge";

export default function RescuePage() {
  const { sessions, totalRescuesCompleted, totalRescueMinutes } = useRescueStore();
  const { tasks } = useTaskStore();
  const [filter, setFilter] = useState<"all" | "overdue" | "urgent">("all");

  const rescueableTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.status === "completed") return false;
      if (filter === "overdue") return isOverdue(t.deadline);
      if (filter === "urgent") return isUrgent(t.deadline, 24);
      return isOverdue(t.deadline) || isUrgent(t.deadline, 24);
    });
  }, [tasks, filter]);

  const productiveRate = sessions.length > 0
    ? Math.round((sessions.filter(s => s.wasProductive).length / sessions.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">🚨 Rescue Timer</h1>
        <p className="text-surface-400 mt-1">
          Just 5 minutes. That's all it takes to build momentum and save a task from being missed.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Rescues Completed", value: totalRescuesCompleted.toString(), color: "text-brand-600", icon: "✅" },
          { label: "Total Minutes Saved", value: `${totalRescueMinutes}m`, color: "text-accent-600", icon: "⏱️" },
          { label: "Productive Rate", value: `${productiveRate}%`, color: productiveRate >= 70 ? "text-accent-600" : "text-warning-600", icon: "🎯" },
          { label: "Tasks Needing Rescue", value: rescueableTasks.length.toString(), color: rescueableTasks.length > 0 ? "text-danger-500" : "text-accent-500", icon: "🚨" },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-center">
              <span className="text-2xl mb-1 block">{stat.icon}</span>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-xs text-surface-400 mt-0.5">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-br from-brand-50/30 to-danger-50/30 border-brand-100">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-brand-100 text-brand-600 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">How the Rescue Timer Works</h3>
            <p className="text-sm text-surface-500 mt-1 leading-relaxed">
              The <strong>5-Minute Rescue</strong> is based on a simple psychological principle: <strong>starting is the hardest part.</strong>
              Once you start working on a task for just 5 minutes, momentum takes over and you'll likely keep going.
            </p>
            <ol className="mt-3 space-y-1.5 text-sm text-surface-500">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">1</span>
                Pick an overdue or urgent task below
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">2</span>
                Click "Start 5-Minute Rescue" — commit to just 5 minutes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">3</span>
                Work until the timer ends, then tell us how it went
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">4</span>
                {">"}80% of users continue working after the 5 minutes! 🚀
              </li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Tasks needing rescue */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-surface-900">Tasks Needing Rescue</h2>
          <div className="flex gap-1 p-1 bg-surface-100 rounded-xl">
            {[
              { value: "all" as const, label: "All At-Risk" },
              { value: "overdue" as const, label: "Overdue" },
              { value: "urgent" as const, label: "Urgent" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-lg transition-all",
                  filter === f.value
                    ? "bg-white text-surface-900 shadow-sm"
                    : "text-surface-500 hover:text-surface-700"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {rescueableTasks.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {rescueableTasks.map((task) => (
              <div key={task.id} className="space-y-3">
                <RescueTimer taskId={task.id} taskTitle={task.title} />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <p className="text-surface-400 font-medium">No tasks need rescuing right now!</p>
                <p className="text-sm text-surface-300 mt-1">You're on top of everything. Great job!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Rescue Sessions */}
      {sessions.length > 0 && (
        <div>
          <h2 className="font-semibold text-surface-900 mb-4">Past Rescue Sessions</h2>
          <div className="space-y-2">
            {sessions.slice(0, 10).map((session) => (
              <Card key={session.id} className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-sm",
                      session.wasProductive ? "bg-accent-50" : "bg-surface-50"
                    )}>
                      {session.wasProductive ? "✅" : "💭"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{session.taskTitle}</p>
                      <p className="text-xs text-surface-400">
                        {Math.round(session.totalSeconds / 60)} min · {new Date(session.completedAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={session.wasProductive ? "success" : "default"}>
                    {session.wasProductive ? "Productive" : "Paused"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
