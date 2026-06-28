"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTaskStore, useUIStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { Task } from "@/lib/types";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Modal } from "@/components/ui/Modal";
import { RescueTimer } from "@/components/rescue/RescueTimer";
import { DeadlinePredictorWidget } from "@/components/rescue/DeadlinePredictor";
import { AccountabilityWidget } from "@/components/accountability/AccountabilityPanel";
import { useRescueStore, useAccountabilityStore } from "@/lib/store";
import {
  getTaskStats,
  formatRelativeTime,
  cn,
  getCategoryIcon,
  sortTasksByDeadline,
  isOverdue,
  isUrgent,
} from "@/lib/utils";

export default function DashboardPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTaskStore();
  const { modalOpen, openModal, closeModal } = useUIStore();
  const { user } = useAuthStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { totalRescuesCompleted, totalRescueMinutes } = useRescueStore();
  const { shares } = useAccountabilityStore();
  const accountabilityCount = shares.filter(s => s.status === "pending" || s.status === "watched").length;

  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  const upcomingTasks = useMemo(
    () => sortTasksByDeadline(tasks.filter((t) => t.status !== "completed")).slice(0, 5),
    [tasks]
  );

  const urgentTasks = useMemo(
    () => tasks.filter((t) => t.status !== "completed" && isUrgent(t.deadline, 24)),
    [tasks]
  );

  const handleAddTask = (taskData: any) => {
    addTask(taskData as any);
    closeModal();
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    openModal("edit-task");
  };

  const handleUpdateTask = (taskData: any) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    }
    setEditingTask(null);
    closeModal();
  };

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">
              {greeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-surface-500 mt-1">
              {tasks.length === 0
                ? "Ready to get things done? Add your first task and let's make today productive! 🚀"
                : stats.overdue > 0
                ? "You've got some tasks waiting — let's tackle them one at a time. You've got this! 💪"
                : stats.pending > 0
                ? `${stats.pending} task${stats.pending !== 1 ? 's' : ''} ahead of you. Small steps lead to big wins — let's go! ⚡`
                : "All caught up! Time to set some new goals and keep the momentum going! 🌟"}
            </p>
          </div>
        </div>
        <Button onClick={() => { setEditingTask(null); openModal("add-task"); }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Task
        </Button>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming & Urgent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Alert */}
          {urgentTasks.length > 0 && (
            <Card className="border-warning-200 bg-warning-50/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-warning-100 text-warning-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-warning-800">
                    {urgentTasks.length} urgent task{urgentTasks.length > 1 ? "s" : ""} due soon
                  </h3>
                  <p className="text-sm text-warning-600 mt-1">
                    These tasks need attention within the next 24 hours.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <Badge variant="info">{upcomingTasks.length} upcoming</Badge>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer"
                      onClick={() => handleEditTask(task)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskStatus(task.id);
                        }}
                        className={cn(
                          "w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0",
                          task.status === "completed"
                            ? "bg-accent-500 border-accent-500"
                            : "border-surface-300"
                        )}
                      >
                        {task.status === "completed" && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          task.status === "completed" && "text-surface-400 line-through"
                        )}>
                          {getCategoryIcon(task.category)} {task.title}
                        </p>
                      </div>
                      <span className={cn(
                        "text-xs font-medium flex-shrink-0",
                        isOverdue(task.deadline) ? "text-danger-500" :
                        isUrgent(task.deadline, 24) ? "text-warning-600" :
                        "text-surface-400"
                      )}>
                        {formatRelativeTime(task.deadline)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-surface-400">
                  <p>No upcoming tasks</p>
                  <p className="text-sm mt-1">Add a task to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Task List */}
          <TaskList
            tasks={tasks}
            onToggle={toggleTaskStatus}
            onDelete={deleteTask}
            onEdit={handleEditTask}
            title="All Tasks"
          />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Today's Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-100" />
                    <circle
                      cx="60" cy="60" r="54"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - stats.completionRate / 100)}`}
                      className="text-brand-500 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-surface-900">{stats.completionRate}%</p>
                      <p className="text-xs text-surface-400">Complete</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-semibold text-surface-900">{stats.completed}</p>
                    <p className="text-xs text-surface-400">Done</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-warning-600">{stats.pending}</p>
                    <p className="text-xs text-surface-400">Pending</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-danger-500">{stats.overdue}</p>
                    <p className="text-xs text-surface-400">Overdue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deadline Predictor */}
          <DeadlinePredictorWidget />

          {/* Accountability Quick View */}
          {accountabilityCount > 0 && (
            <div className="p-4 rounded-2xl border border-accent-200 bg-gradient-to-br from-accent-50/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent-100 text-accent-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900">Accountability Squad</p>
                  <p className="text-xs text-surface-500">{accountabilityCount} active share{accountabilityCount !== 1 ? 's' : ''}</p>
                </div>
                <a href="/dashboard/accountability" className="ml-auto text-xs text-accent-600 hover:text-accent-700 font-medium">
                  View
                </a>
              </div>
            </div>
          )}

          {/* Rescue Timer (for first overdue task) — moved below */}
          {tasks.filter(t => t.status !== "completed" && (isOverdue(t.deadline) || isUrgent(t.deadline, 24))).length > 0 && (
            <RescueTimer
              taskId={tasks.filter(t => t.status !== "completed" && (isOverdue(t.deadline) || isUrgent(t.deadline, 24)))[0]?.id || ""}
              taskTitle={tasks.filter(t => t.status !== "completed" && (isOverdue(t.deadline) || isUrgent(t.deadline, 24)))[0]?.title || ""}
            />
          )}

          {/* Rescue Stats */}
          {totalRescuesCompleted > 0 && (
            <div className="p-4 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-100 text-brand-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900">Rescue Sessions</p>
                  <p className="text-xs text-surface-500">{totalRescuesCompleted} completed · {totalRescueMinutes}m total</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Quick Insight */}
          <Card className="gradient-border">
            <CardHeader>
              <CardTitle>🤖 AI Insight</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-brand-50 border border-brand-100">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">💡</span>
                      <div>
                        <p className="text-sm font-medium text-brand-800">Productivity Tip</p>
                        <p className="text-xs text-brand-600 mt-1">
                          {stats.overdue > 0
                            ? `You have ${stats.overdue} overdue tasks. Try breaking them down into smaller steps to make progress.`
                            : stats.urgent > 0
                            ? `${stats.urgent} tasks need attention soon. Consider which ones can be delegated or deprioritized.`
                            : "Great job staying on top of your tasks! Keep the momentum going."}
                        </p>
                      </div>
                    </div>
                  </div>
                  {stats.completionRate < 50 && (
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = "/dashboard/companion"}>
                      Talk to AI Companion
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-surface-400 text-sm">Add tasks to get AI insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={modalOpen === "add-task" || modalOpen === "edit-task"}
        onClose={() => { closeModal(); setEditingTask(null); }}
        title={editingTask ? "Edit Task" : "Create New Task"}
      >
        <TaskForm
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          onCancel={() => { closeModal(); setEditingTask(null); }}
          initialTask={editingTask}
        />
      </Modal>
    </div>
  );
}
