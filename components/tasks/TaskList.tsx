"use client";

import React, { useState, useMemo } from "react";
import { Task, TaskPriority, TaskStatus, TaskCategory } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  title?: string;
  compact?: boolean;
}

type FilterType = "all" | TaskStatus | "urgent";

export function TaskList({ tasks, onToggle, onDelete, onEdit, title, compact }: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply status/urgency filter
    switch (filter) {
      case "pending":
        filtered = filtered.filter((t) => t.status === "pending");
        break;
      case "in-progress":
        filtered = filtered.filter((t) => t.status === "in-progress");
        break;
      case "completed":
        filtered = filtered.filter((t) => t.status === "completed");
        break;
      case "missed":
        filtered = filtered.filter((t) => t.status === "missed");
        break;
      case "urgent":
        filtered = filtered.filter((t) => {
          if (t.status === "completed") return false;
          const hoursLeft = (new Date(t.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
          return hoursLeft < 24 && hoursLeft > 0;
        });
        break;
    }

    // Apply search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [tasks, filter, searchQuery]);

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Done" },
    { value: "urgent", label: "Urgent" },
  ];

  if (compact) {
    return (
      <div className="space-y-2">
        {filteredTasks.slice(0, 5).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onClick={onEdit}
          />
        ))}
        {filteredTasks.length === 0 && (
          <p className="text-center text-surface-400 py-8 text-sm">
            No tasks to show
          </p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Tasks"}</CardTitle>
        <span className="text-sm text-surface-400">{filteredTasks.length} tasks</span>
      </CardHeader>

      {/* Filters */}
      <div className="px-6 pb-4 flex items-center gap-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-surface-100 rounded-xl">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                filter === f.value
                  ? "bg-white text-surface-900 shadow-sm"
                  : "text-surface-500 hover:text-surface-700"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-surface-200 bg-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {/* Task list */}
      <div className="px-6 pb-6 space-y-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onClick={onEdit}
          />
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-surface-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <p className="text-surface-400 font-medium">No tasks found</p>
            <p className="text-surface-300 text-sm mt-1">
              {filter !== "all" ? "Try a different filter" : "Add your first task to get started"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
