"use client";

import { create } from "zustand";
import { generateId } from "./utils";

// ============================================
// Types
// ============================================
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (name: string, email: string, password: string) => boolean;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  clearError: () => void;
  checkSession: () => void;
}

const USERS_KEY = "lifesaver_users";
const SESSION_KEY = "lifesaver_session";

function getUsers(): Record<string, { user: User; password: string }> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { user: User; password: string }>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveSession(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkSession: () => {
    const session = getSession();
    set({
      user: session,
      isAuthenticated: !!session,
      isLoading: false,
    });
  },

  signUp: (name: string, email: string, password: string) => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    if (users[normalizedEmail]) {
      set({ error: "An account with this email already exists." });
      return false;
    }

    // Validate inputs
    if (name.trim().length < 2) {
      set({ error: "Name must be at least 2 characters." });
      return false;
    }
    if (password.length < 6) {
      set({ error: "Password must be at least 6 characters." });
      return false;
    }

    // Create user
    const newUser: User = {
      id: generateId(),
      name: name.trim(),
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    };

    users[normalizedEmail] = { user: newUser, password };
    saveUsers(users);
    saveSession(newUser);

    set({
      user: newUser,
      isAuthenticated: true,
      error: null,
    });
    return true;
  },

  signIn: (email: string, password: string) => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase().trim();

    const record = users[normalizedEmail];
    if (!record) {
      set({ error: "No account found with this email." });
      return false;
    }

    if (record.password !== password) {
      set({ error: "Incorrect password. Please try again." });
      return false;
    }

    saveSession(record.user);

    set({
      user: record.user,
      isAuthenticated: true,
      error: null,
    });
    return true;
  },

  signOut: () => {
    saveSession(null);
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
