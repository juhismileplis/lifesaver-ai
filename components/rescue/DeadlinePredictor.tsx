"use client";

import React, { useMemo } from "react";
import { Task, DeadlinePrediction } from "@/lib/types";
import { usePredictionsStore, useTaskStore } from "@/lib/store";
import { cn, getDaysUntilDeadline, getCategoryIcon } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface RiskBadgeProps {
  task: Task;
  prediction?: DeadlinePrediction;
  compact?: boolean;
}

export function RiskBadge({ task, prediction, compact }: RiskBadgeProps) {
  // Auto-calculate risk if no prediction exists
  const risk = useMemo(() => {
    if (prediction) return prediction;

    const hoursLeft = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    const daysLeft = getDaysUntilDeadline(task.deadline);

    if (task.status === "completed") return { riskLevel: "low" as const, probabilityPercentage: 0, reason: "", suggestedAction: "" };
    if (hoursLeft < 0) return { riskLevel: "critical" as const, probabilityPercentage: 95, reason: "This task is overdue!", suggestedAction: "Start right now or reschedule" };
    if (hoursLeft < 2) return { riskLevel: "critical" as const, probabilityPercentage: 85, reason: "Due very soon!", suggestedAction: "Drop everything and do this now" };
    if (hoursLeft < 6) return { riskLevel: "high" as const, probabilityPercentage: 65, reason: "Due within hours", suggestedAction: "Focus on this next" };
    if (daysLeft <= 1) return { riskLevel: "high" as const, probabilityPercentage: 55, reason: "Due tomorrow", suggestedAction: "Prepare to work on this" };
    if (daysLeft <= 3) return { riskLevel: "medium" as const, probabilityPercentage: 35, reason: `${daysLeft} days until deadline`, suggestedAction: "Block time in your schedule" };
    return { riskLevel: "low" as const, probabilityPercentage: 10, reason: "Plenty of time", suggestedAction: "Keep it on your radar" };
  }, [task, prediction]);

  if (task.status === "completed") return null;

  const getRiskColor = () => {
    switch (risk.riskLevel) {
      case "critical": return { bg: "bg-danger-500", text: "text-white", label: "🔴 Danger" };
      case "high": return { bg: "bg-warning-500", text: "text-white", label: "🟡 At Risk" };
      case "medium": return { bg: "bg-brand-400", text: "text-white", label: "🟠 Watch" };
      case "low": return { bg: "bg-accent-400", text: "text-white", label: "🟢 On Track" };
    }
  };

  const color = getRiskColor();

  if (compact) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium",
        color.bg, color.text
      )}>
        {risk.probabilityPercentage}% risk
      </span>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
      color.bg, color.text
    )}>
      <span>{color.label}</span>
      <span className="opacity-80">|</span>
      <span>{risk.probabilityPercentage}% chance of missing</span>
    </div>
  );
}

export function DeadlinePredictorWidget() {
  const { tasks, toggleTaskStatus } = useTaskStore();
  const { predictions } = usePredictionsStore();

  // Generate predictions for all non-completed tasks
  const taskPredictions = useMemo(() => {
    const pending = tasks.filter(t => t.status !== "completed");
    const newPredictions: DeadlinePrediction[] = pending.map(task => {
      const existing = predictions.find(p => p.taskId === task.id);
      const hoursLeft = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
      const daysLeft = getDaysUntilDeadline(task.deadline);

      let riskLevel: DeadlinePrediction["riskLevel"];
      let probabilityPercentage: number;
      let reason: string;
      let suggestedAction: string;

      if (hoursLeft < 0) {
        riskLevel = "critical";
        probabilityPercentage = 95;
        reason = "Already overdue. Every minute counts.";
        suggestedAction = "Start right now — even 5 minutes helps.";
      } else if (hoursLeft < 4) {
        riskLevel = "critical";
        probabilityPercentage = 80;
        reason = "Extremely tight deadline.";
        suggestedAction = "Drop everything and focus on this.";
      } else if (daysLeft <= 1) {
        riskLevel = "high";
        probabilityPercentage = 60;
        reason = "Due within 24 hours.";
        suggestedAction = "Prioritize this above all else.";
      } else if (daysLeft <= 3) {
        riskLevel = "medium";
        probabilityPercentage = 35;
        reason = `${daysLeft} days to deadline.`;
        suggestedAction = "Block time in your calendar now.";
      } else {
        riskLevel = "low";
        probabilityPercentage = 10;
        reason = `${daysLeft} days away. Comfortable.`;
        suggestedAction = "Keep progressing steadily.";
      }

      return {
        taskId: task.id,
        riskLevel,
        probabilityPercentage,
        reason,
        suggestedAction,
        lastUpdated: new Date().toISOString(),
      } as DeadlinePrediction;
    });

    return newPredictions;
  }, [tasks, predictions]);

  // Sort by risk (most critical first)
  const sortedPredictions = useMemo(() => {
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...taskPredictions].sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
  }, [taskPredictions]);

  const criticalCount = sortedPredictions.filter(p => p.riskLevel === "critical").length;
  const highCount = sortedPredictions.filter(p => p.riskLevel === "high").length;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "border-l-danger-400 bg-gradient-to-r from-danger-50/80 to-transparent";
      case "high": return "border-l-warning-400 bg-gradient-to-r from-warning-50/80 to-transparent";
      case "medium": return "border-l-brand-400 bg-gradient-to-r from-brand-50/50 to-transparent";
      case "low": return "border-l-accent-400 bg-gradient-to-r from-accent-50/30 to-transparent";
      default: return "border-l-surface-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔮 Deadline Predictor
          {(criticalCount + highCount) > 0 && (
            <span className="text-xs font-normal text-danger-500 animate-pulse">
              {criticalCount + highCount} at risk
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedPredictions.length > 0 ? (
          <div className="space-y-2">
            {sortedPredictions.slice(0, 5).map((pred) => {
              const task = tasks.find(t => t.id === pred.taskId);
              if (!task) return null;
              return (
                <div
                  key={pred.taskId}
                  className={cn(
                    "p-3 rounded-xl border-l-4 bg-white border border-surface-200 transition-all hover:shadow-sm",
                    getRiskColor(pred.riskLevel)
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span>{getCategoryIcon(task.category)}</span>
                        <span className="text-sm font-medium text-surface-900 truncate">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-xs font-medium",
                          pred.riskLevel === "critical" ? "text-danger-600" :
                          pred.riskLevel === "high" ? "text-warning-600" :
                          pred.riskLevel === "medium" ? "text-brand-600" : "text-accent-600"
                        )}>
                          {pred.probabilityPercentage}% miss risk
                        </span>
                        <span className="text-xs text-surface-400">|</span>
                        <span className="text-xs text-surface-400">{pred.reason}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const t = tasks.find(ts => ts.id === task.id);
                        if (t && t.status !== "completed") {
                          toggleTaskStatus(t.id);
                        }
                      }}
                      className="flex-shrink-0 w-5 h-5 rounded border-2 border-surface-300 hover:border-brand-400 flex items-center justify-center transition-colors"
                    >
                      {task.status === "completed" && (
                        <svg className="w-3 h-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {pred.riskLevel !== "low" && (
                    <div className="mt-2 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      <span className="text-xs text-brand-700">{pred.suggestedAction}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔮</span>
            </div>
            <p className="text-surface-400 text-sm">Add tasks to see predictions</p>
          </div>
        )}

        {/* Summary */}
        {sortedPredictions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-100">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="w-3 h-3 rounded-full bg-danger-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-surface-900">{criticalCount}</p>
                <p className="text-[10px] text-surface-400">Critical</p>
              </div>
              <div>
                <div className="w-3 h-3 rounded-full bg-warning-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-surface-900">{highCount}</p>
                <p className="text-[10px] text-surface-400">High Risk</p>
              </div>
              <div>
                <div className="w-3 h-3 rounded-full bg-brand-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-surface-900">{sortedPredictions.filter(p => p.riskLevel === "medium").length}</p>
                <p className="text-[10px] text-surface-400">Watch</p>
              </div>
              <div>
                <div className="w-3 h-3 rounded-full bg-accent-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-surface-900">{sortedPredictions.filter(p => p.riskLevel === "low").length}</p>
                <p className="text-[10px] text-surface-400">On Track</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
