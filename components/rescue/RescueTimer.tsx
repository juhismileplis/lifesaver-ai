"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRescueStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface RescueTimerProps {
  taskId: string;
  taskTitle: string;
  compact?: boolean;
}

export function RescueTimer({ taskId, taskTitle, compact }: RescueTimerProps) {
  const {
    isRescueActive,
    activeTaskId,
    elapsedSeconds,
    startRescue,
    endRescue,
    resetRescue,
    tick,
  } = useRescueStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wasProductive, setWasProductive] = useState<boolean | null>(null);

  const isThisActive = isRescueActive && activeTaskId === taskId;

  // Timer tick
  useEffect(() => {
    if (isThisActive) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isThisActive, tick]);

  // Auto-complete at 5 minutes (300 seconds)
  useEffect(() => {
    if (isThisActive && elapsedSeconds >= 300) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setShowFeedback(true);
    }
  }, [isThisActive, elapsedSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = Math.min((elapsedSeconds / 300) * 100, 100);

  const handleStart = () => {
    startRescue(taskId, taskTitle);
  };

  const handlePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setShowFeedback(true);
  };

  const handleFeedback = (productive: boolean) => {
    setWasProductive(productive);
    endRescue(productive);
    setShowFeedback(false);
    setTimeout(() => setWasProductive(null), 2000);
  };

  const isComplete = wasProductive !== null && !isRescueActive;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {!isThisActive && !isComplete && (
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-danger-50 text-danger-600 border border-danger-200 hover:bg-danger-100 transition-all hover:shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Rescue (5 min)
          </button>
        )}
        {isThisActive && (
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-200" />
                <circle
                  cx="16" cy="16" r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                  className="text-danger-500 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-bold text-danger-600">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>
            <button
              onClick={handlePause}
              className="p-1 rounded-lg bg-surface-100 text-surface-500 hover:bg-surface-200 transition-colors"
              title="Stop rescue session"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
              </svg>
            </button>
          </div>
        )}
        {isComplete && (
          <span className={cn(
            "text-xs font-medium",
            wasProductive ? "text-accent-600" : "text-surface-400"
          )}>
            {wasProductive ? "✅ Rescue complete!" : "⏸️ Rescue paused"}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-500",
      isThisActive && "border-danger-300 bg-gradient-to-br from-danger-50/50 to-transparent ring-2 ring-danger-200",
      isComplete && wasProductive && "border-accent-200 bg-gradient-to-br from-accent-50/50 to-transparent"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isThisActive ? (
            <>
              <span className="w-3 h-3 rounded-full bg-danger-500 animate-pulse" />
              Rescue in Progress
            </>
          ) : isComplete ? (
            <>
              <span className={wasProductive ? "text-accent-500" : "text-surface-400"}>Rescue Session</span>
            </>
          ) : (
            <>
              <span>🚨 5-Minute Rescue</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isThisActive && !showFeedback && !isComplete && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-danger-100 to-danger-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-surface-700 font-medium mb-1">
              Just 5 minutes. That's all it takes.
            </p>
            <p className="text-sm text-surface-400 mb-4">
              You only need to start. Momentum will carry you.
            </p>
            <Button onClick={handleStart} size="lg" className="min-w-[200px] bg-danger-500 hover:bg-danger-600 shadow-lg shadow-danger-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.335a.375.375 0 01-.557-.328V8.665c0-.303.346-.508.557-.328l5.603 3.335z" />
              </svg>
              Start 5-Minute Rescue
            </Button>
            <p className="text-xs text-surface-400 mt-2">No pressure. Just show up.</p>
          </div>
        )}

        {isThisActive && !showFeedback && (
          <div className="text-center py-4">
            {/* Big timer */}
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-100" />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                  className={cn(
                    "transition-all duration-1000",
                    progress < 50 ? "text-danger-500" : progress < 80 ? "text-warning-500" : "text-accent-500"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className={cn(
                    "text-5xl font-bold tabular-nums",
                    progress < 50 ? "text-danger-600" : progress < 80 ? "text-warning-600" : "text-accent-600"
                  )}>
                    {formatTime(elapsedSeconds)}
                  </p>
                  <p className="text-sm text-surface-400 mt-1">
                    {300 - elapsedSeconds > 60
                      ? `${Math.floor((300 - elapsedSeconds) / 60)} min remaining`
                      : "Less than a minute!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Task being rescued */}
            <p className="text-surface-700 text-sm mb-1">
              Working on: <strong className="text-surface-900">{taskTitle}</strong>
            </p>
            <p className="text-xs text-surface-400 mb-4">You've got this! Just keep going.</p>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={handlePause}
                className="min-w-[120px]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                </svg>
                Done Early
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  resetRescue();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {showFeedback && !isComplete && (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning-100 to-warning-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💪</span>
            </div>
            <p className="text-surface-700 font-medium mb-1">Great effort! How did it go?</p>
            <p className="text-sm text-surface-400 mb-4">Did those 5 minutes help you make progress?</p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleFeedback(false)}
                className="min-w-[120px]"
              >
                😅 Not really
              </Button>
              <Button
                onClick={() => handleFeedback(true)}
                className="min-w-[120px] bg-accent-500 hover:bg-accent-600 shadow-lg shadow-accent-200"
              >
                🚀 Yes! Made progress
              </Button>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="text-center py-4 animate-fade-in">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
              wasProductive ? "bg-gradient-to-br from-accent-100 to-accent-50" : "bg-gradient-to-br from-surface-100 to-surface-50"
            )}>
              <span className="text-3xl">{wasProductive ? "🎉" : "💭"}</span>
            </div>
            <p className={cn(
              "font-medium mb-1",
              wasProductive ? "text-accent-700" : "text-surface-500"
            )}>
              {wasProductive
                ? "Amazing! You made progress on this task!"
                : "That's okay! Showing up is half the battle."}
            </p>
            <p className="text-sm text-surface-400">
              {wasProductive
                ? "Every small win adds up. Keep the momentum going!"
                : "Try breaking the task into even smaller steps next time."}
            </p>
            <Button
              variant="outline"
              onClick={() => resetRescue()}
              className="mt-4"
            >
              Start Another Rescue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
