"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { useTaskStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Navbar() {
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, signOut } = useAuthStore();
  const { tasks } = useTaskStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Keyboard shortcut: Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = () => {
    signOut();
    setShowDropdown(false);
    router.push("/");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !tasks.length) return [];
    const q = searchQuery.toLowerCase();
    return tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [searchQuery, tasks]);

  // Notifications (overdue & urgent tasks)
  const notifications = useMemo(() => {
    const notifs: { id: string; title: string; message: string; type: "urgent" | "overdue" | "info"; taskId: string }[] = [];
    const now = new Date();
    tasks
      .filter((t) => t.status !== "completed")
      .forEach((task) => {
        const deadline = new Date(task.deadline);
        const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursLeft < 0) {
          notifs.push({
            id: `overdue-${task.id}`,
            title: "Overdue Task",
            message: `"${task.title}" was due ${Math.abs(Math.floor(hoursLeft))}h ago`,
            type: "overdue",
            taskId: task.id,
          });
        } else if (hoursLeft < 24) {
          notifs.push({
            id: `urgent-${task.id}`,
            title: "Urgent Task",
            message: `"${task.title}" is due in ${Math.floor(hoursLeft)}h`,
            type: "urgent",
            taskId: task.id,
          });
        }
      });
    return notifs.slice(0, 5);
  }, [tasks]);

  const navigateToTask = (taskId: string) => {
    setShowSearch(false);
    setSearchQuery("");
    router.push("/dashboard/tasks");
  };

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-surface-200 transition-all duration-300 flex items-center px-6",
      sidebarOpen ? "left-64" : "left-0 lg:left-20"
    )}>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="p-2 -ml-2 rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors lg:hidden"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Right side actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-xl text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
            title="Search tasks (Ctrl+K)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          {/* Search Overlay */}
          {showSearch && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden animate-fade-in">
              <div className="p-3 border-b border-surface-100">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-50">
                  <svg className="w-4 h-4 text-surface-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search tasks, categories, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-surface-900 placeholder-surface-400 focus:outline-none"
                  />
                  <kbd className="px-1.5 py-0.5 text-xs text-surface-400 bg-surface-200 rounded font-mono">Esc</kbd>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {searchQuery.trim() === "" ? (
                  <div className="text-center py-8">
                    <svg className="w-10 h-10 mx-auto text-surface-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <p className="text-sm text-surface-400">Type to search your tasks</p>
                    <p className="text-xs text-surface-300 mt-1">Search by title, description, category, or tags</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-surface-400">No tasks found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => navigateToTask(task.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors text-left"
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          task.priority === "critical" ? "bg-danger-500" :
                          task.priority === "high" ? "bg-warning-500" :
                          task.priority === "medium" ? "bg-brand-500" : "bg-surface-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">{task.title}</p>
                          <p className="text-xs text-surface-400 truncate">
                            {task.category} · {task.status} · Due {new Date(task.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          task.status === "completed" ? "bg-accent-50 text-accent-600" :
                          task.priority === "critical" ? "bg-danger-50 text-danger-600" : "bg-surface-100 text-surface-500"
                        )}>
                          {task.status === "completed" ? "Done" : task.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors relative"
            title="Notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500 animate-ping" />
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
                <h3 className="font-semibold text-surface-900">Notifications</h3>
                {notifications.length > 0 && (
                  <span className="text-xs text-surface-400">{notifications.length} new</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <svg className="w-10 h-10 mx-auto text-surface-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    <p className="text-sm text-surface-400">All clear!</p>
                    <p className="text-xs text-surface-300 mt-1">No new notifications</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => { setShowNotifications(false); router.push("/dashboard/tasks"); }}
                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors text-left"
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg flex-shrink-0",
                          notif.type === "overdue" ? "bg-danger-50 text-danger-500" :
                          notif.type === "urgent" ? "bg-warning-50 text-warning-600" : "bg-brand-50 text-brand-600"
                        )}>
                          {notif.type === "overdue" ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900">{notif.title}</p>
                          <p className="text-xs text-surface-500 mt-0.5">{notif.message}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 pl-3 border-l border-surface-200 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-surface-700">{user?.name || "User"}</p>
              <p className="text-xs text-surface-400">{user?.email || "user@example.com"}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-brand-200">
              {initials}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-surface-200 py-2 animate-fade-in">
              <div className="px-4 py-3 border-b border-surface-100">
                <p className="text-sm font-medium text-surface-900">{user?.name}</p>
                <p className="text-xs text-surface-400">{user?.email}</p>
              </div>

              <button
                onClick={() => { setShowDropdown(false); router.push("/dashboard"); }}
                className="w-full text-left px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
                </svg>
                Dashboard
              </button>

              <button
                onClick={() => { setShowDropdown(false); router.push("/dashboard/insights"); }}
                className="w-full text-left px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Insights
              </button>

              <button
                onClick={() => { setShowDropdown(false); router.push("/dashboard/companion"); }}
                className="w-full text-left px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                AI Companion
              </button>

              <div className="border-t border-surface-100 mt-1 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-3 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
