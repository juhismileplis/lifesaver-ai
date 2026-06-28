"use client";

import React, { useState, useEffect } from "react";
import { Task, TaskPriority, TaskCategory } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TaskFormProps {
  onSubmit: (task: any) => void;
  onCancel: () => void;
  initialTask?: Task | null;
}

export function TaskForm({ onSubmit, onCancel, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || "medium");
  const [category, setCategory] = useState<TaskCategory>(initialTask?.category || "other");
  const [deadline, setDeadline] = useState(
    initialTask?.deadline ? new Date(initialTask.deadline).toISOString().slice(0, 16) : ""
  );
  const [tags, setTags] = useState(initialTask?.tags?.join(", ") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 86400000).toISOString(),
      estimatedMinutes: 0,
      status: initialTask?.status || "pending",
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      isRecurring: initialTask?.isRecurring || false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title *"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />

      <div>
        <label className="text-sm font-medium text-surface-700 block mb-1.5">
          Description
        </label>
        <textarea
          placeholder="Add details, notes, or context..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-surface-700 block mb-1.5">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-surface-700 block mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            <option value="work">💼 Work</option>
            <option value="study">📚 Study</option>
            <option value="personal">🧘 Personal</option>
            <option value="health">💪 Health</option>
            <option value="finance">💰 Finance</option>
            <option value="social">👥 Social</option>
            <option value="other">📋 Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        {/* Tags field moved here for better layout balance */}
        <Input
          label="Tags"
          placeholder="e.g., urgent, project"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>



      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" className="flex-1">
          {initialTask ? "Update Task" : "Add Task"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
