"use client";

import React, { useState, useMemo } from "react";
import { useTaskStore, useUIStore } from "@/lib/store";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { getTaskStats } from "@/lib/utils";

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTaskStore();
  const { modalOpen, openModal, closeModal } = useUIStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Tasks</h1>
          <p className="text-surface-400 mt-1">
            Manage and organize all your tasks
          </p>
        </div>
        <Button onClick={() => { setEditingTask(null); openModal("add-task"); }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Task
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-3 flex-wrap">
        <div className="px-4 py-2 rounded-xl bg-white border border-surface-200 shadow-sm">
          <span className="text-sm text-surface-400">Total: </span>
          <span className="font-semibold text-surface-900">{stats.total}</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white border border-surface-200 shadow-sm">
          <span className="text-sm text-surface-400">Pending: </span>
          <span className="font-semibold text-warning-600">{stats.pending}</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white border border-surface-200 shadow-sm">
          <span className="text-sm text-surface-400">Completed: </span>
          <span className="font-semibold text-accent-600">{stats.completed}</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white border border-surface-200 shadow-sm">
          <span className="text-sm text-surface-400">Overdue: </span>
          <span className="font-semibold text-danger-500">{stats.overdue}</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white border border-surface-200 shadow-sm">
          <span className="text-sm text-surface-400">Urgent: </span>
          <span className="font-semibold text-danger-500">{stats.urgent}</span>
        </div>
      </div>

      {/* Task List */}
      <TaskList
        tasks={tasks}
        onToggle={toggleTaskStatus}
        onDelete={deleteTask}
        onEdit={handleEditTask}
      />

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
