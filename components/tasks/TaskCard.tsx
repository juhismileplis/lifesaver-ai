"use client";

import React, { useState } from "react";
import { Task } from "@/lib/types";
import {
  cn,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
  getCategoryIcon,
  formatDate,
  formatRelativeTime,
  isOverdue,
  isUrgent,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { RescueTimer } from "@/components/rescue/RescueTimer";
import { RiskBadge } from "@/components/rescue/DeadlinePredictor";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (task: Task) => void;
}

export function TaskCard({ task, onToggle, onDelete, onClick }: TaskCardProps) {
  const isTaskOverdue = !task.completedAt && isOverdue(task.deadline);
  const isTaskUrgent = !task.completedAt && isUrgent(task.deadline, 24);
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

  return (
    <div
      className={cn(
        "group relative p-4 rounded-xl border bg-white transition-all duration-200 cursor-pointer hover:shadow-md hover:border-surface-300",
        isTaskOverdue && "border-danger-200 bg-danger-50/30",
        isTaskUrgent && "border-warning-200 bg-warning-50/30",
        task.status === "completed" && "opacity-75 bg-surface-50"
      )}
      onClick={() => onClick?.(task)}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={cn(
            "mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
            task.status === "completed"
              ? "bg-accent-500 border-accent-500"
              : "border-surface-300 hover:border-brand-400"
          )}
        >
          {task.status === "completed" && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getCategoryIcon(task.category)}</span>
            <h3
              className={cn(
                "text-sm font-medium truncate",
                task.status === "completed" ? "text-surface-400 line-through" : "text-surface-900"
              )}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="text-sm text-surface-400 mt-1 line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Subtasks progress */}
          {task.subtasks.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-surface-400">
                {completedSubtasks}/{task.subtasks.length}
              </span>
            </div>
          )}

          {/* Rescue Timer & Risk Badge */}
          {task.status !== "completed" && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {(isTaskOverdue || isTaskUrgent) && (
                <RescueTimer taskId={task.id} taskTitle={task.title} compact />
              )}
              <RiskBadge task={task} compact />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={
              task.priority === "critical" ? "danger" :
              task.priority === "high" ? "warning" :
              task.priority === "medium" ? "info" : "default"
            }>
              {getPriorityLabel(task.priority)}
            </Badge>
            <Badge variant={
              task.status === "completed" ? "success" :
              task.status === "missed" ? "danger" :
              task.status === "in-progress" ? "info" : "default"
            }>
              {getStatusLabel(task.status)}
            </Badge>
            <span className={cn(
              "text-xs font-medium",
              isTaskOverdue ? "text-danger-500" :
              isTaskUrgent ? "text-warning-600" :
              "text-surface-400"
            )}>
              {formatRelativeTime(task.deadline)}
            </span>

          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Urgent pulse indicator */}
      {isTaskUrgent && !task.completedAt && (
        <div className="absolute top-2 right-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500" />
          </span>
        </div>
      )}
    </div>
  );
}
