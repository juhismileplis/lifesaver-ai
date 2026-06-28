"use client";

import React, { useState, useMemo } from "react";
import { useTaskStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn, getCategoryIcon, getPriorityColor, formatDate } from "@/lib/utils";

type ViewType = "day" | "week" | "month";

export default function CalendarPage() {
  const { tasks, updateTask, toggleTaskStatus } = useTaskStore();
  const [view, setView] = useState<ViewType>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  ).getDay();

  const monthName = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: number) => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1)
    );
  };

  const getTasksForDay = (day: number) => {
    const dateStr = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day
    ).toDateString();
    return tasks.filter((t) => new Date(t.deadline).toDateString() === dateStr);
  };

  const today = new Date().toDateString();
  const isToday = (day: number) =>
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toDateString() === today;

  // Upcoming tasks sorted by date
  const upcomingTasks = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.status !== "completed")
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 10),
    [tasks]
  );

  // Group upcoming by date
  const groupedUpcoming = useMemo(() => {
    const groups: Record<string, typeof tasks> = {};
    upcomingTasks.forEach((task) => {
      const dateStr = formatDate(task.deadline);
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(task);
    });
    return groups;
  }, [upcomingTasks]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Calendar</h1>
        <p className="text-surface-400 mt-1">View and manage your schedule</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold text-surface-900">{monthName}</h3>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Today
              </button>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 p-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-surface-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 p-2 gap-px">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] p-1" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayTasks = getTasksForDay(day);
                return (
                  <div
                    key={day}
                    className={cn(
                      "min-h-[80px] p-1 rounded-lg border border-transparent transition-colors cursor-pointer hover:bg-surface-50",
                      isToday(day) && "border-brand-300 bg-brand-50/50"
                    )}
                    onClick={() => setSelectedDate(
                      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-medium mb-1",
                        isToday(day) ? "text-brand-600" : "text-surface-400"
                      )}
                    >
                      {day}
                    </p>
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-[10px] px-1 py-0.5 rounded truncate font-medium",
                            task.priority === "critical" && "bg-danger-100 text-danger-700",
                            task.priority === "high" && "bg-warning-100 text-warning-700",
                            task.priority === "medium" && "bg-brand-100 text-brand-700",
                            task.priority === "low" && "bg-surface-100 text-surface-600",
                            task.status === "completed" && "line-through opacity-50"
                          )}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <p className="text-[10px] text-surface-400 pl-1">
                          +{dayTasks.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Upcoming Tasks Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <Badge variant="info">{upcomingTasks.length} tasks</Badge>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedUpcoming).map(([date, dateTasks]) => (
                <div key={date} className="mb-4 last:mb-0">
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                    {date}
                  </p>
                  <div className="space-y-2">
                    {dateTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer group"
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        <button className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          task.status === "completed"
                            ? "bg-accent-500 border-accent-500"
                            : "border-surface-300 group-hover:border-brand-400"
                        )}>
                          {task.status === "completed" && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            task.status === "completed" && "line-through text-surface-400"
                          )}>
                            {getCategoryIcon(task.category)} {task.title}
                          </p>
                          <p className="text-xs text-surface-400">
                            {task.priority} priority
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-surface-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <p className="text-surface-400 text-sm">No upcoming tasks</p>
                  <p className="text-surface-300 text-xs mt-1">Add tasks to see your schedule</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Calendar Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <svg className="w-10 h-10 mx-auto text-surface-300 mb-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8H13.95L12 4.576 10.05 8H6.106l3.957 2.874L8.02 15.5 12 12.632l3.98 2.868-1.043-4.626z"/>
                </svg>
                <p className="text-sm text-surface-500">Connect Google Calendar</p>
                <p className="text-xs text-surface-400 mt-1">
                  Sync your events and tasks in one place
                </p>
                <button className="mt-3 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition-colors">
                  Connect
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
