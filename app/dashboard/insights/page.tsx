"use client";

import React, { useMemo, useState } from "react";
import { useTaskStore, useGoalStore, useHabitStore, useInsightsStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, getTaskStats } from "@/lib/utils";
import { Goal, Habit, ProductivityInsight } from "@/lib/types";

// Milestone definitions for goals
const MILESTONE_PERCENTAGES = [25, 50, 75, 100];

function getMilestoneEmoji(percentage: number): string {
  if (percentage >= 100) return "🏆";
  if (percentage >= 75) return "🌟";
  if (percentage >= 50) return "🔥";
  if (percentage >= 25) return "💪";
  return "🎯";
}

function getMotivationalMessage(goal: Goal): string {
  if (goal.progress >= 100) return "Goal completed! Amazing work! 🎉";
  if (goal.progress >= 75) return "Almost there! Finish strong! 💪";
  if (goal.progress >= 50) return "Halfway there! Keep pushing! 🔥";
  if (goal.progress >= 25) return "Great start! You're making progress! 🌟";
  return "Every journey begins with a single step! 🚀";
}

export default function InsightsPage() {
  const { tasks, addTask, deleteTask, toggleTaskStatus } = useTaskStore();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoalStore();
  const { habits, addHabit, logHabit, deleteHabit } = useHabitStore();
  const { insights, productivityScore, setInsights, setProductivityScore } = useInsightsStore();
  const [newGoal, setNewGoal] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [newHabit, setNewHabit] = useState("");
  const [activeTab, setActiveTab] = useState<"insights" | "goals" | "habits">("insights");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  // Local fallback insights with clearer explanations
  const localInsights: ProductivityInsight[] = useMemo(() => {
    if (insights.length > 0) return insights;

    const result: ProductivityInsight[] = [];
    if (stats.overdue > 0) {
      result.push({
        id: "overdue",
        type: "warning",
        title: "⚠️ Overdue Tasks — Let's Fix This",
        description: `You have ${stats.overdue} task${stats.overdue > 1 ? "s" : ""} past their deadline. Here's what this means: These tasks haven't been completed yet and are holding you back. Try this: Review each one, see if the deadline is still realistic, and either reschedule or break it into smaller steps to make it less overwhelming.`,
        severity: "high",
      });
    }
    if (stats.completionRate > 70 && stats.completed > 0) {
      result.push({
        id: "great-progress",
        type: "achievement",
        title: "🌟 You're on Fire!",
        description: `You've completed ${stats.completed} out of ${stats.total} tasks (${stats.completionRate}% completion rate). Why this matters: High completion rates show you're consistent and reliable. To keep this up, try grouping similar tasks together (batching) and taking short breaks between them. You're building a great productivity habit!`,
        severity: "low",
      });
    }
    if (tasks.length > 0) {
      const urgentCount = tasks.filter(t => {
        if (t.status === "completed") return false;
        const hoursLeft = (new Date(t.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
        return hoursLeft < 24 && hoursLeft > 0;
      }).length;
      
      if (urgentCount > 0) {
        result.push({
          id: "urgent-items",
          type: "warning",
          title: "⏰ Urgent Tasks Due Soon",
          description: `${urgentCount} task${urgentCount > 1 ? "s" : ""} need${urgentCount === 1 ? "s" : ""} your attention within the next 24 hours. Quick action plan: Decide which ones are truly critical, delegate if possible, and focus on completing just one right now to reduce pressure.`,
          severity: "high",
        });
      }
    }
    if (habits.length > 0) {
      const bestHabit = habits.reduce((best, h) => (h.streak > best.streak ? h : best), habits[0]);
      if (bestHabit.streak >= 3) {
        result.push({
          id: "habit-insight",
          type: "trend",
          title: "🔥 Habit Building Success!",
          description: `You've maintained "${bestHabit.name}" for ${bestHabit.streak} day${bestHabit.streak > 1 ? "s" : ""} in a row! Here's the science: It takes an average of 66 days to form a new habit. You're well on your way! Try linking this habit to an existing routine (like right after breakfast) to make it automatic.`,
          severity: "low",
        });
      }
    }
    if (result.length === 0 && tasks.length > 0) {
      result.push({
        id: "general-tip",
        type: "suggestion",
        title: "💡 Productivity Boost Tip",
        description: `You have ${stats.pending} task${stats.pending !== 1 ? "s" : ""} to work on. Try the "2-Minute Rule": If a task takes less than 2 minutes, do it immediately. For bigger tasks, start with just 5 minutes — you'll often find the momentum to keep going!`,
        severity: "low",
      });
    }
    return result;
  }, [insights, stats, tasks, habits]);

  const handleAnalyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            deadline: t.deadline,
            estimatedMinutes: t.estimatedMinutes,
            category: t.category,
          })),
          habits: habits.map((h) => ({
            name: h.name,
            streak: h.streak,
            logs: h.logs,
          })),
        }),
      });
      const data = await res.json();
      if (data.insights) setInsights(data.insights);
      if (data.productivityScore) setProductivityScore(data.productivityScore);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning": return "⚠️";
      case "suggestion": return "💡";
      case "achievement": return "🏆";
      case "trend": return "📈";
      default: return "📌";
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-l-danger-400 bg-gradient-to-r from-danger-50/80 to-transparent";
      case "medium": return "border-l-warning-400 bg-gradient-to-r from-warning-50/80 to-transparent";
      case "low": return "border-l-brand-400 bg-gradient-to-r from-brand-50/30 to-transparent";
      default: return "border-l-surface-400 bg-surface-50";
    }
  };

  const handleGoalProgress = (goalId: string, increment: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newProgress = Math.min(100, Math.max(0, goal.progress + increment));
      updateGoal(goalId, { progress: newProgress });
    }
  };

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Insights & Analytics
            <span className="ml-2 text-sm font-normal text-surface-400">Track your productivity journey</span>
          </h1>
          <p className="text-surface-400 mt-1 text-sm">
            Understand your work patterns, set goals, and build better habits
          </p>
        </div>
        <Button onClick={handleAnalyzeWithAI} size="sm" disabled={isAnalyzing}>
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              AI Analysis
            </>
          )}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-white rounded-2xl border border-surface-200 w-fit shadow-sm">
        {[
          { value: "insights" as const, label: "📊 Insights", desc: "Productivity analysis" },
          { value: "goals" as const, label: "🎯 Goals", desc: "Track your objectives" },
          { value: "habits" as const, label: "🔥 Habits", desc: "Build daily routines" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
              activeTab === tab.value
                ? "bg-surface-900 text-white shadow-lg shadow-surface-900/20 scale-105"
                : "text-surface-500 hover:text-surface-700 hover:bg-surface-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "insights" && (
        <div className="space-y-6">
          {/* Productivity Score with Explanation */}
          <Card>
            <CardHeader>
              <CardTitle>Productivity Score</CardTitle>
              <Badge variant={
                productivityScore >= 70 ? "success" :
                productivityScore >= 40 ? "warning" : "danger"
              }>
                {productivityScore >= 70 ? "Excellent" : productivityScore >= 40 ? "Good" : "Needs Focus"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-36 h-36">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-surface-100" />
                    <circle
                      cx="60" cy="60" r="52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - productivityScore / 100)}`}
                      className={cn(
                        "transition-all duration-1000 drop-shadow-lg",
                        productivityScore >= 70 ? "text-accent-500 stroke-accent-500" :
                        productivityScore >= 40 ? "text-warning-500 stroke-warning-500" :
                        "text-danger-500 stroke-danger-500"
                      )}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className={cn(
                        "text-3xl font-bold",
                        productivityScore >= 70 ? "text-accent-500" :
                        productivityScore >= 40 ? "text-warning-500" :
                        "text-danger-500"
                      )}>
                        {productivityScore}
                      </p>
                      <p className="text-xs text-surface-400">/100</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-accent-500" />
                        <span className="text-xs text-surface-400">Completed</span>
                      </div>
                      <p className="text-lg font-bold text-surface-900">{stats.completed}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-warning-500" />
                        <span className="text-xs text-surface-400">Pending</span>
                      </div>
                      <p className="text-lg font-bold text-surface-900">{stats.pending}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-danger-500" />
                        <span className="text-xs text-surface-400">Overdue</span>
                      </div>
                      <p className="text-lg font-bold text-danger-500">{stats.overdue}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-brand-500" />
                        <span className="text-xs text-surface-400">Total</span>
                      </div>
                      <p className="text-lg font-bold text-surface-900">{stats.total}</p>
                    </div>
                  </div>
                  <p className="text-sm text-surface-500 leading-relaxed">
                    <strong className="text-surface-700">What this means:</strong>{" "}
                    {productivityScore >= 70 
                      ? "You're consistently completing tasks and staying on top of your workload. Your productivity habits are strong! Keep up the great work and consider setting more ambitious goals."
                      : productivityScore >= 40 
                      ? "You're making progress but there's room for improvement. Focus on clearing overdue tasks and setting realistic daily goals. Small consistent steps lead to big results."
                      : "You have several tasks to catch up on. Don't worry — start by clearing just one overdue task today. Progress, not perfection!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-900">AI-Powered Insights</h3>
              <span className="text-xs text-surface-400">Click "AI Analysis" for fresh insights</span>
            </div>
            {localInsights.length > 0 ? (
              localInsights.map((insight, idx) => (
                <div
                  key={insight.id}
                  className={cn(
                    "p-5 rounded-2xl border border-l-4 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                    getInsightColor(insight.severity)
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-surface-900 text-base mb-1">{insight.title}</h4>
                      <p className="text-sm text-surface-600 leading-relaxed">{insight.description}</p>
                    </div>
                    <Badge variant={
                      insight.severity === "high" ? "danger" :
                      insight.severity === "medium" ? "warning" : "info"
                    }>
                      {insight.severity === "high" ? "Action needed" : insight.severity === "medium" ? "Watch out" : "Tip"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <Card>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <p className="text-surface-400 font-medium">No insights yet</p>
                    <p className="text-sm text-surface-300 mt-1 max-w-md mx-auto">
                      Add some tasks first, then click the <strong>"AI Analysis"</strong> button above to get personalized productivity insights and recommendations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Task Completion Rate", value: `${stats.completionRate}%`, color: stats.completionRate >= 70 ? "text-accent-500" : "text-warning-500", detail: `${stats.completed} of ${stats.total} done` },
              { label: "Overdue Tasks", value: stats.overdue.toString(), color: stats.overdue > 0 ? "text-danger-500" : "text-accent-500", detail: stats.overdue > 0 ? "Need attention" : "All caught up!" },
              { label: "Active Habits", value: habits.length.toString(), color: habits.length > 0 ? "text-brand-500" : "text-surface-400", detail: habits.length > 0 ? `${habits.reduce((s, h) => s + h.streak, 0)} total streak days` : "Start tracking!" },
              { label: "Goals Set", value: goals.length.toString(), color: goals.length > 0 ? "text-accent-500" : "text-surface-400", detail: goals.length > 0 ? `${goals.filter(g => g.progress >= 100).length} completed` : "Set your first goal" },
            ].map((stat) => (
              <Card key={stat.label}>
                <div className="text-center">
                  <p className="text-xs text-surface-400 font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{stat.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "goals" && (
        <div className="space-y-6">
          {/* Add Goal - Enhanced */}
          <Card className="bg-gradient-to-br from-brand-50/50 to-accent-50/30 border-brand-100">
            <CardHeader>
              <CardTitle>🎯 Set a New Goal</CardTitle>
              <span className="text-xs text-surface-400">Define what you want to achieve</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g., Complete my certification course"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Brief description (optional)"
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                    className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(e.target.value)}
                      className="flex-1 rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                    />
                    <Button
                      onClick={() => {
                        if (newGoal.trim()) {
                          const goalTitle = newGoal.trim();
                          // Create a linked daily task for this goal
                          addTask({
                            title: `🎯 ${goalTitle}`,
                            description: newGoalDescription.trim() || "Daily goal task — keep progressing!",
                            priority: "high",
                            category: "other",
                            deadline: new Date().toISOString(),
                            estimatedMinutes: 0,
                            status: "pending",
                            tags: ["goal"],
                            isRecurring: true,
                            recurringPattern: "daily",
                          });
                          addGoal({
                            title: goalTitle,
                            description: newGoalDescription.trim(),
                            targetDate: new Date(newGoalTarget).toISOString(),
                            progress: 0,
                            tasks: [],
                          });
                          setNewGoal("");
                          setNewGoalDescription("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals List - Enhanced */}
          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.map((goal) => {
                const nextMilestone = MILESTONE_PERCENTAGES.find(m => m > goal.progress) || 100;
                const isExpanded = expandedGoal === goal.id;
                return (
                  <Card
                    key={goal.id}
                    className={cn(
                      "transition-all duration-300 hover:shadow-md",
                      goal.progress >= 100 && "border-accent-200 bg-gradient-to-r from-accent-50/30 to-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{getMilestoneEmoji(goal.progress)}</span>
                          <div>
                            <h3 className={cn(
                              "font-semibold",
                              goal.progress >= 100 ? "text-accent-600" : "text-surface-900"
                            )}>
                              {goal.title}
                              {goal.progress >= 100 && " ✓"}
                            </h3>
                            {goal.description && (
                              <p className="text-xs text-surface-400 mt-0.5">{goal.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className={cn(
                              "font-medium",
                              goal.progress >= 100 ? "text-accent-600" : "text-surface-500"
                            )}>
                              {goal.progress}% complete
                            </span>
                            <span className="text-surface-400">
                              Next milestone: {nextMilestone}%
                            </span>
                          </div>
                          <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-700 ease-out",
                                goal.progress >= 100 
                                  ? "bg-gradient-to-r from-accent-500 to-accent-400" 
                                  : "bg-gradient-to-r from-brand-500 to-accent-500"
                              )}
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          {/* Milestone markers */}
                          <div className="flex justify-between px-0.5">
                            {MILESTONE_PERCENTAGES.map((m) => (
                              <div key={m} className="flex flex-col items-center">
                                <div className={cn(
                                  "w-2 h-2 rounded-full transition-colors",
                                  goal.progress >= m ? "bg-brand-500" : "bg-surface-200"
                                )} />
                                <span className={cn(
                                  "text-[10px] mt-0.5",
                                  goal.progress >= m ? "text-brand-600 font-medium" : "text-surface-300"
                                )}>
                                  {m}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Motivational message */}
                        <p className="text-xs text-surface-500 mt-2 italic">
                          {getMotivationalMessage(goal)}
                        </p>

                        {/* Target date */}
                        <p className="text-xs text-surface-400 mt-1">
                          🎯 Target: {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-start gap-1 ml-4">
                        {goal.progress < 100 && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleGoalProgress(goal.id, 10)}
                              className="p-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors text-xs font-medium"
                              title="Progress +10%"
                            >
                              +10%
                            </button>
                            <button
                              onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                              className="p-1.5 rounded-lg bg-surface-50 text-surface-500 hover:bg-surface-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M19.5 8.25l-7.5 7.5-7.5-7.5" : "M8.25 4.5l7.5 7.5-7.5 7.5"} />
                              </svg>
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            deleteGoal(goal.id);
                            // Also delete the linked task
                            const linkedTask = tasks.find(t => t.title.includes(goal.title) && t.tags?.includes("goal"));
                            if (linkedTask) deleteTask(linkedTask.id);
                          }}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-surface-100 animate-slide-up">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-surface-50">
                            <p className="text-xs text-surface-400">Created</p>
                            <p className="text-sm font-medium text-surface-700 mt-0.5">
                              {new Date(goal.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-50">
                            <p className="text-xs text-surface-400">Days Left</p>
                            <p className="text-sm font-medium text-surface-700 mt-0.5">
                              {Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleGoalProgress(goal.id, 5)}>+5%</Button>
                          <Button size="sm" variant="outline" onClick={() => handleGoalProgress(goal.id, 25)}>+25%</Button>
                          <Button size="sm" variant="outline" onClick={() => handleGoalProgress(goal.id, -10)}>-10%</Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning-100 to-warning-50 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <p className="text-surface-400 font-medium">No goals set yet</p>
                    <p className="text-sm text-surface-300 mt-1">Set your first goal above to start tracking your progress!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === "habits" && (
        <div className="space-y-6">
          {/* Add Habit */}
          <Card className="bg-gradient-to-br from-accent-50/30 to-brand-50/30 border-accent-100">
            <CardHeader>
              <CardTitle>🔥 Build a New Habit</CardTitle>
              <span className="text-xs text-surface-400">Small daily actions, big results</span>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g., Read for 15 minutes, Meditate, Exercise"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  className="flex-1 rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newHabit.trim()) {
                      const habitName = newHabit.trim();
                      addTask({
                        title: `🌱 ${habitName}`,
                        description: "Daily habit — check off when done",
                        priority: "medium",
                        category: "health",
                        deadline: new Date().toISOString(),
                        estimatedMinutes: 0,
                        status: "pending",
                        tags: ["habit"],
                        isRecurring: true,
                        recurringPattern: "daily",
                      });
                      addHabit({ name: habitName, frequency: "daily" });
                      setNewHabit("");
                    }
                  }}
                />
                    <Button
                      onClick={() => {
                        if (newHabit.trim()) {
                          const habitName = newHabit.trim();
                          addTask({
                            title: `🌱 ${habitName}`,
                            description: "Daily habit — check off when done",
                            priority: "medium",
                            category: "health",
                            deadline: new Date().toISOString(),
                            estimatedMinutes: 0,
                            status: "pending",
                            tags: ["habit"],
                            isRecurring: true,
                            recurringPattern: "daily",
                          });
                          addHabit({ name: habitName, frequency: "daily" });
                          setNewHabit("");
                        }
                      }}
                    >
                      Add Habit
                    </Button>
              </div>
            </CardContent>
          </Card>

          {/* Habits List - Enhanced */}
          <div className="space-y-4">
            {habits.length > 0 ? (
              habits.map((habit) => {
                const weekDays = getWeekDays();
                const loggedDays = habit.logs.filter(log => weekDays.includes(log));
                
                return (
                  <Card key={habit.id} className="hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl",
                          habit.streak >= 7 ? "bg-gradient-to-br from-accent-100 to-accent-50" :
                          habit.streak >= 3 ? "bg-gradient-to-br from-brand-100 to-brand-50" :
                          "bg-gradient-to-br from-surface-100 to-surface-50"
                        )}>
                          {habit.streak >= 7 ? "🔥" : habit.streak >= 3 ? "💪" : "🌱"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-surface-900">{habit.name}</h3>
                          <p className="text-xs text-surface-400">
                            {habit.frequency} · 
                            <span className={cn(
                              "font-medium ml-1",
                              habit.streak >= 7 ? "text-accent-600" : "text-surface-500"
                            )}>
                              {habit.streak} day streak
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={habit.logs.includes(new Date().toISOString().split("T")[0]) ? "primary" : "outline"}
                          onClick={() => {
                            logHabit(habit.id);
                            // Also toggle the linked task if it exists
                            const linkedTask = tasks.find(t => t.title.includes(habit.name) && t.tags?.includes("habit"));
                            if (linkedTask && linkedTask.status !== "completed") {
                              toggleTaskStatus(linkedTask.id);
                            }
                          }}
                          className="min-w-[100px]"
                        >
                          {habit.logs.includes(new Date().toISOString().split("T")[0]) ? "✅ Done Today" : "Log Today"}
                        </Button>
                        <button
                          onClick={() => {
                            deleteHabit(habit.id);
                            // Also delete the linked task
                            const linkedTask = tasks.find(t => t.title.includes(habit.name) && t.tags?.includes("habit"));
                            if (linkedTask) deleteTask(linkedTask.id);
                          }}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Weekly streak calendar */}
                    <div className="mt-4">
                      <p className="text-xs text-surface-400 mb-2 font-medium">This Week</p>
                      <div className="flex gap-1.5">
                        {weekDays.map((day) => {
                          const dayDate = new Date(day);
                          const dayName = dayDate.toLocaleDateString("en-US", { weekday: "short" });
                          const isLogged = habit.logs.includes(day);
                          const isToday = day === new Date().toISOString().split("T")[0];
                          return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-[10px] text-surface-400">{dayName}</span>
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium transition-all duration-300",
                                isLogged 
                                  ? "bg-accent-500 text-white shadow-sm shadow-accent-200 scale-105" 
                                  : isToday 
                                  ? "bg-surface-100 text-surface-400 border-2 border-dashed border-surface-300" 
                                  : "bg-surface-50 text-surface-300"
                              )}>
                                {isLogged ? "✓" : dayDate.getDate()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Streak indicator */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                        {habit.streak > 0 && (
                          <div 
                            className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (habit.streak / 21) * 100)}%` }}
                          />
                        )}
                      </div>
                      <span className="text-xs text-surface-400 font-medium">
                        {habit.streak >= 21 ? "🎉 Mastered!" : habit.streak >= 7 ? "🔥 Great streak!" : habit.streak >= 3 ? "💪 Getting there!" : "🌱 Just started"}
                      </span>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🔥</span>
                    </div>
                    <p className="text-surface-400 font-medium">No habits tracked yet</p>
                    <p className="text-sm text-surface-300 mt-1">Start tracking a habit above! Consistency is the key to success.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
