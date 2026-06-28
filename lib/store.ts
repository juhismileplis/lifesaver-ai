import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Task,
  Goal,
  Habit,
  ChatMessage,
  ProductivityInsight,
  CalendarEvent,
  UserPreferences,
  RescueSession,
  DeadlinePrediction,
  AccountabilityShare,
} from "./types";
import { generateId } from "./utils";

// Helper to scope storage keys per user (so different users have different data)
function getStorageKey(baseKey: string): string {
  if (typeof window === "undefined") return baseKey;
  try {
    const session = localStorage.getItem("lifesaver_session");
    if (session) {
      const user = JSON.parse(session);
      return `${baseKey}_${user.id}`;
    }
  } catch {}
  return baseKey;
}

// Shared custom storage that scopes data per user
const userScopedStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem(getStorageKey(name));
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: unknown) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(getStorageKey(name), JSON.stringify(value));
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(getStorageKey(name));
  },
};

// ============================================
// Task Store
// ============================================
interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "subtasks">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            {
              ...task,
              id: generateId(),
              createdAt: new Date().toISOString(),
              subtasks: [],
            },
            ...state.tasks,
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      toggleTaskStatus: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === "completed" ? "pending" : "completed",
                  completedAt:
                    t.status === "completed" ? undefined : new Date().toISOString(),
                }
              : t
          ),
        })),
      addSubTask: (taskId, title) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: [
                    ...t.subtasks,
                    { id: generateId(), title, completed: false },
                  ],
                }
              : t
          ),
        })),
      toggleSubTask: (taskId, subTaskId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((st) =>
                    st.id === subTaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
              : t
          ),
        })),
      setTasks: (tasks) => set({ tasks }),
    }),
{
      name: "lifesaver_tasks",
      storage: userScopedStorage,
    }
  )
);

// ============================================
// Goals Store
// ============================================
interface GoalStore {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (goal) =>
        set((state) => ({
          goals: [
            { ...goal, id: generateId(), createdAt: new Date().toISOString() },
            ...state.goals,
          ],
        })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
    }),
{
      name: "lifesaver_goals",
      storage: userScopedStorage,
    }
  )
);

// ============================================
// Habits Store
// ============================================
interface HabitStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "streak" | "logs">) => void;
  logHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      addHabit: (habit) =>
        set((state) => ({
          habits: [
            {
              ...habit,
              id: generateId(),
              createdAt: new Date().toISOString(),
              streak: 0,
              logs: [],
            },
            ...state.habits,
          ],
        })),
      logHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            const today = new Date().toISOString().split("T")[0];
            if (h.logs.includes(today)) return h;
            const newLogs = [...h.logs, today];
            // Calculate streak
            let streak = 0;
            const sorted = [...newLogs].sort().reverse();
            for (const log of sorted) {
              const expected = new Date();
              expected.setDate(expected.getDate() - streak);
              if (log === expected.toISOString().split("T")[0]) {
                streak++;
              } else {
                break;
              }
            }
            return { ...h, logs: newLogs, streak };
          }),
        })),
      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),
    }),
{
      name: "lifesaver_habits",
      storage: userScopedStorage,
    }
  )
);

// ============================================
// Chat Store
// ============================================
interface ChatStore {
  messages: ChatMessage[];
  isProcessing: boolean;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setProcessing: (processing: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "👋 Hey there! I'm your LifeSaver AI companion. I'll help you stay on top of your tasks, meet deadlines, and boost your productivity. What's on your plate today?",
          timestamp: new Date().toISOString(),
          type: "text",
        },
      ],
      isProcessing: false,
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: generateId(),
              timestamp: new Date().toISOString(),
            },
          ],
        })),
      setProcessing: (processing) => set({ isProcessing: processing }),
      clearMessages: () => set({ messages: [] }),
    }),
{
      name: "lifesaver_chat",
      storage: userScopedStorage,
    }
  )
);

// ============================================
// Insights Store
// ============================================
interface InsightsStore {
  insights: ProductivityInsight[];
  productivityScore: number;
  setInsights: (insights: ProductivityInsight[]) => void;
  setProductivityScore: (score: number) => void;
}

export const useInsightsStore = create<InsightsStore>()(
  persist(
    (set) => ({
      insights: [],
      productivityScore: 75,
      setInsights: (insights) => set({ insights }),
      setProductivityScore: (score) => set({ productivityScore: score }),
    }),
{
      name: "lifesaver_insights",
      storage: userScopedStorage,
    }
  )
);

// ============================================
// Calendar Events Store
// ============================================
interface CalendarStore {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  removeEvent: (id: string) => void;
  setEvents: (events: CalendarEvent[]) => void;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: generateId() }],
        })),
      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
      setEvents: (events) => set({ events }),
    }),
{
      name: "lifesaver_calendar",
      storage: userScopedStorage,
    }
  )
);

// ============================================
// UI Store
// ============================================
interface UIStore {
  sidebarOpen: boolean;
  modalOpen: string | null;
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      modalOpen: null,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      openModal: (id) => set({ modalOpen: id }),
      closeModal: () => set({ modalOpen: null }),
    }),
{
      name: "lifesaver_ui",
      // Only persist sidebar state, not modal state
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
      storage: userScopedStorage,
    }
  )
);

// ============================================
// Rescue Timer Store
// ============================================
interface RescueStore {
  sessions: RescueSession[];
  isRescueActive: boolean;
  activeTaskId: string | null;
  activeTaskTitle: string;
  elapsedSeconds: number;
  totalRescuesCompleted: number;
  totalRescueMinutes: number;
  startRescue: (taskId: string, taskTitle: string) => void;
  endRescue: (wasProductive: boolean) => void;
  tick: () => void;
  resetRescue: () => void;
  clearSessions: () => void;
}

export const useRescueStore = create<RescueStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      isRescueActive: false,
      activeTaskId: null,
      activeTaskTitle: "",
      elapsedSeconds: 0,
      totalRescuesCompleted: 0,
      totalRescueMinutes: 0,
      startRescue: (taskId, taskTitle) =>
        set({
          isRescueActive: true,
          activeTaskId: taskId,
          activeTaskTitle: taskTitle,
          elapsedSeconds: 0,
        }),
      endRescue: (wasProductive) => {
        const state = get();
        const session: RescueSession = {
          id: generateId(),
          taskId: state.activeTaskId || "",
          taskTitle: state.activeTaskTitle,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          totalSeconds: state.elapsedSeconds,
          wasProductive,
        };
        const minutes = Math.round(state.elapsedSeconds / 60);
        set((prev) => ({
          sessions: [session, ...prev.sessions],
          isRescueActive: false,
          activeTaskId: null,
          activeTaskTitle: "",
          elapsedSeconds: 0,
          totalRescuesCompleted: prev.totalRescuesCompleted + 1,
          totalRescueMinutes: prev.totalRescueMinutes + minutes,
        }));
      },
      tick: () =>
        set((state) => ({
          elapsedSeconds: state.elapsedSeconds + 1,
        })),
      resetRescue: () =>
        set({
          isRescueActive: false,
          activeTaskId: null,
          activeTaskTitle: "",
          elapsedSeconds: 0,
        }),
      clearSessions: () => set({ sessions: [] }),
    }),
{
      name: "lifesaver_rescue",
      storage: userScopedStorage,
    }
  )
);

// ============================================
// Deadline Predictions Store
// ============================================
interface PredictionsStore {
  predictions: DeadlinePrediction[];
  setPredictions: (predictions: DeadlinePrediction[]) => void;
  updatePrediction: (taskId: string, update: Partial<DeadlinePrediction>) => void;
  clearPredictions: () => void;
}

export const usePredictionsStore = create<PredictionsStore>()(
  persist(
    (set) => ({
      predictions: [],
      setPredictions: (predictions) => set({ predictions }),
      updatePrediction: (taskId, update) =>
        set((state) => ({
          predictions: state.predictions.map((p) =>
            p.taskId === taskId ? { ...p, ...update } : p
          ),
        })),
      clearPredictions: () => set({ predictions: [] }),
    }),
{
      name: "lifesaver_predictions",
      storage: userScopedStorage,
    }
  )
);

// ============================================
// Accountability Squad Store
// ============================================
interface AccountabilityStore {
  shares: AccountabilityShare[];
  addShare: (share: Omit<AccountabilityShare, "id" | "createdAt" | "encouragementMessages">) => void;
  addEncouragement: (shareId: string, from: string, message: string) => void;
  updateShareStatus: (shareId: string, status: AccountabilityShare["status"]) => void;
  removeShare: (shareId: string) => void;
}

export const useAccountabilityStore = create<AccountabilityStore>()(
  persist(
    (set) => ({
      shares: [],
      addShare: (share) =>
        set((state) => ({
          shares: [
            {
              ...share,
              id: generateId(),
              createdAt: new Date().toISOString(),
              encouragementMessages: [],
            },
            ...state.shares,
          ],
        })),
      addEncouragement: (shareId, from, message) =>
        set((state) => ({
          shares: state.shares.map((s) =>
            s.id === shareId
              ? {
                  ...s,
                  encouragementMessages: [
                    ...s.encouragementMessages,
                    { from, message, timestamp: new Date().toISOString() },
                  ],
                }
              : s
          ),
        })),
      updateShareStatus: (shareId, status) =>
        set((state) => ({
          shares: state.shares.map((s) =>
            s.id === shareId ? { ...s, status } : s
          ),
        })),
      removeShare: (shareId) =>
        set((state) => ({
          shares: state.shares.filter((s) => s.id !== shareId),
        })),
    }),
{
      name: "lifesaver_accountability",
      storage: userScopedStorage,
    }
  )
);
