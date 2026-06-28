// ============================================
// LifeSaver AI - Type Definitions
// ============================================

export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "pending" | "in-progress" | "completed" | "missed";
export type TaskCategory =
  | "work"
  | "study"
  | "personal"
  | "health"
  | "finance"
  | "social"
  | "other";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  deadline: string; // ISO date string
  estimatedMinutes: number;
  completedAt?: string;
  createdAt: string;
  tags: string[];
  isRecurring: boolean;
  recurringPattern?: "daily" | "weekly" | "monthly";
  subtasks: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number; // 0-100
  tasks: string[]; // Task IDs
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  streak: number;
  logs: string[]; // Date strings YYYY-MM-DD
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number; // 0-100
  tasks: string[]; // Task IDs
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  taskId?: string;
  isAISuggested: boolean;
}

export interface AIAnalysis {
  taskId: string;
  priorityScore: number;
  reason: string;
  suggestedSchedule?: string;
  suggestedDeadline?: string;
  breakdown?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  type?: "text" | "insight" | "alert" | "suggestion";
}

export interface ProductivityInsight {
  id: string;
  type: "warning" | "suggestion" | "achievement" | "trend";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  workingHours: { start: string; end: string };
  notificationPreferences: {
    email: boolean;
    push: boolean;
    criticalOnly: boolean;
  };
}

// ============================================
// Rescue Timer Types
// ============================================

export interface RescueSession {
  id: string;
  taskId: string;
  taskTitle: string;
  startedAt: string;
  completedAt?: string;
  totalSeconds: number; // how long they actually focused
  wasProductive: boolean; // user self-reports after timer ends
}

// ============================================
// Deadline Prediction Types
// ============================================

export interface DeadlinePrediction {
  taskId: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  probabilityPercentage: number; // 0-100 chance of being missed
  reason: string;
  suggestedAction: string;
  lastUpdated: string;
}

// ============================================
// Accountability Squad Types
// ============================================

export interface AccountabilityShare {
  id: string;
  taskId: string;
  taskTitle: string;
  friendName: string;
  friendEmail?: string;
  shareLink: string;
  status: "pending" | "watched" | "completed" | "missed";
  encouragementMessages: { from: string; message: string; timestamp: string }[];
  createdAt: string;
}
