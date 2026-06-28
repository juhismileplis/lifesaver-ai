import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Task, TaskPriority, TaskStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMs < 0) {
    const past = Math.abs(diffDays);
    if (past === 0) return "Today";
    if (past === 1) return "Yesterday";
    return `${past} days ago`;
  }

  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMinutes <= 1) return "Due now";
      return `Due in ${diffMinutes}m`;
    }
    return `Due in ${diffHours}h`;
  }
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return formatDate(date);
}

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case "critical":
      return "text-danger-500 bg-danger-50 border-danger-200";
    case "high":
      return "text-warning-600 bg-warning-50 border-warning-200";
    case "medium":
      return "text-brand-600 bg-brand-50 border-brand-200";
    case "low":
      return "text-surface-500 bg-surface-100 border-surface-200";
  }
}

export function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
  }
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case "pending":
      return "bg-surface-100 text-surface-600";
    case "in-progress":
      return "bg-brand-100 text-brand-700";
    case "completed":
      return "bg-accent-100 text-accent-700";
    case "missed":
      return "bg-danger-100 text-danger-700";
  }
}

export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "missed":
      return "Missed";
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    work: "💼",
    study: "📚",
    personal: "🧘",
    health: "💪",
    finance: "💰",
    social: "👥",
    other: "📋",
  };
  return icons[category] || "📋";
}

export function isOverdue(deadline: string): boolean {
  return new Date(deadline) < new Date();
}

export function isUrgent(deadline: string, hoursThreshold = 24): boolean {
  const diffMs = new Date(deadline).getTime() - new Date().getTime();
  return diffMs > 0 && diffMs < hoursThreshold * 60 * 60 * 1000;
}

export function getDaysUntilDeadline(deadline: string): number {
  const diffMs = new Date(deadline).getTime() - new Date().getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder: Record<TaskPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return [...tasks].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

export function sortTasksByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
}

export function getTaskStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const missed = tasks.filter((t) => t.status === "missed").length;
  const overdue = tasks.filter(
    (t) => t.status !== "completed" && isOverdue(t.deadline)
  ).length;
  const urgent = tasks.filter(
    (t) => t.status !== "completed" && isUrgent(t.deadline)
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, inProgress, missed, overdue, urgent, completionRate };
}
