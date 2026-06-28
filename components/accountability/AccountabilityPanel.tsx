"use client";

import React, { useState } from "react";
import { useAccountabilityStore, useTaskStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface ShareTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

function ShareTaskModal({ isOpen, onClose, taskId, taskTitle }: ShareTaskModalProps) {
  const { addShare } = useAccountabilityStore();
  const [friendName, setFriendName] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const name = friendName.trim() || "Accountability Partner";
    const shareLink = `${window.location.origin}/dashboard/accountability?task=${taskId}&share=${Date.now()}`;

    addShare({
      taskId,
      taskTitle,
      friendName: name,
      shareLink,
      status: "pending",
    });

    navigator.clipboard.writeText(
      `👋 Hey ${name}! I'm sharing my task "${taskTitle}" with you on LifeSaver AI. Help keep me accountable!\n\n🔗 ${shareLink}`
    );

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setFriendName("");
      onClose();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👥 Share Task with a Friend">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">
            Friend's Name
          </label>
          <input
            type="text"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            placeholder="Enter a name (optional)"
            className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleShare()}
          />
        </div>
        <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
          <div className="flex items-start gap-3">
            <span className="text-xl">📋</span>
            <div>
              <p className="text-sm font-medium text-surface-900">{taskTitle}</p>
              <p className="text-xs text-surface-500 mt-0.5">
                Your friend will be notified and can send you encouragement!
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleShare} className="flex-1">
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                Share & Copy Link
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function AccountabilityWidget() {
  const { shares, updateShareStatus, addEncouragement, removeShare } = useAccountabilityStore();
  const { tasks, toggleTaskStatus } = useTaskStore();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string; title: string } | null>(null);
  const { modalOpen, openModal, closeModal } = useUIStore();

  const pendingShares = shares.filter(s => s.status === "pending" || s.status === "watched");
  const completedShares = shares.filter(s => s.status === "completed");

  const handleTaskShared = (taskId: string, taskTitle: string) => {
    setSelectedTask({ id: taskId, title: taskTitle });
    setShareModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👥 Accountability Squad
            {pendingShares.length > 0 && (
              <Badge variant="warning">{pendingShares.length} active</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick share buttons for pending tasks */}
          <div className="mb-4">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">
              Share a task with a friend
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {tasks.filter(t => t.status !== "completed").slice(0, 4).map(task => (
                <button
                  key={task.id}
                  onClick={() => handleTaskShared(task.id, task.title)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-50 transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center text-xs flex-shrink-0 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                  </div>
                  <span className="text-sm text-surface-700 truncate flex-1">{task.title}</span>
                  <svg className="w-3.5 h-3.5 text-surface-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
              {tasks.filter(t => t.status !== "completed").length === 0 && (
                <p className="text-sm text-surface-400 text-center py-3">No tasks to share yet</p>
              )}
            </div>
          </div>

          {/* Shared tasks */}
          {shares.length > 0 && (
            <div className="border-t border-surface-100 pt-4">
              <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">
                Shared Tasks
              </p>
              <div className="space-y-2">
                {shares.map((share) => {
                  const task = tasks.find(t => t.id === share.taskId);
                  return (
                    <div key={share.id} className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">{share.taskTitle}</p>
                          <p className="text-xs text-surface-400">
                            Shared with <strong>{share.friendName}</strong>
                          </p>
                        </div>
                        <Badge variant={
                          share.status === "completed" ? "success" :
                          share.status === "watched" ? "info" :
                          share.status === "missed" ? "danger" : "warning"
                        }>
                          {share.status}
                        </Badge>
                      </div>

                      {/* Encouragement messages */}
                      {share.encouragementMessages.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {share.encouragementMessages.slice(-2).map((msg, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-surface-500">
                              <span className="text-brand-500 font-medium">{msg.from}:</span>
                              <span className="italic">"{msg.message}"</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-2 flex items-center gap-2">
                        {task && task.status !== "completed" && (
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className="text-xs text-accent-600 hover:text-accent-700 font-medium"
                          >
                            ✓ Mark complete
                          </button>
                        )}
                        <button
                          onClick={() => removeShare(share.id)}
                          className="text-xs text-surface-400 hover:text-danger-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Modal */}
      {selectedTask && (
        <ShareTaskModal
          isOpen={shareModalOpen}
          onClose={() => { setShareModalOpen(false); setSelectedTask(null); }}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
        />
      )}
    </>
  );
}
