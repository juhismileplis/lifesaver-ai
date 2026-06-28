"use client";

import React, { useState } from "react";
import { useAccountabilityStore, useTaskStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function AccountabilityPage() {
  const { shares, addEncouragement, updateShareStatus, removeShare } = useAccountabilityStore();
  const { tasks, toggleTaskStatus } = useTaskStore();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [encourageModalOpen, setEncourageModalOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<string | null>(null);
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [encourageMessage, setEncourageMessage] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const activeShares = shares.filter(s => s.status === "pending" || s.status === "watched");
  const completedShares = shares.filter(s => s.status === "completed");
  const missedShares = shares.filter(s => s.status === "missed");

  const handleShareTask = (taskId: string, taskTitle: string) => {
    const name = friendName.trim() || "Accountability Partner";
    const link = `${window.location.origin}/dashboard/accountability?shared=${Date.now()}`;

    addShare({
      taskId,
      taskTitle,
      friendName: name,
      friendEmail: friendEmail.trim() || undefined,
      shareLink: link,
      status: "pending",
    });

    setShareLink(link);
    navigator.clipboard.writeText(
      `👋 Hey ${name}! I'm sharing my task "${taskTitle}" on LifeSaver AI. Help keep me accountable!\n\n🔗 ${link}\n\nSend me encouragement when I complete it! 🙌`
    );
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShareModalOpen(false);
      setFriendName("");
      setFriendEmail("");
    }, 2000);
  };

  const handleSendEncouragement = () => {
    if (!selectedShare || !encourageMessage.trim()) return;
    addEncouragement(selectedShare, "Friend", encourageMessage);
    setEncourageMessage("");
    setEncourageModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">👥 Accountability Squad</h1>
          <p className="text-surface-400 mt-1">
            Share tasks with friends who'll help you stay on track. Social accountability doubles completion rates.
          </p>
        </div>
        <Badge variant="info" size="md">
          {activeShares.length} active
        </Badge>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-br from-accent-50/30 to-brand-50/30 border-accent-100">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📤</span>
            </div>
            <p className="text-sm font-medium text-surface-900">1. Share a task</p>
            <p className="text-xs text-surface-500 mt-0.5">Pick a task and share it with a friend</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-sm font-medium text-surface-900">2. Get encouragement</p>
            <p className="text-xs text-surface-500 mt-0.5">Friends send you motivational messages</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-sm font-medium text-surface-900">3. Complete & celebrate</p>
            <p className="text-xs text-surface-500 mt-0.5">Mark done and your friend celebrates with you</p>
          </div>
        </div>
      </Card>

      {/* Share a Task */}
      <Card>
        <CardHeader>
          <CardTitle>Share a Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Friend's name (required)"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Friend's email (optional)"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
              />
            </div>

            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">
              Select a task to share
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tasks.filter(t => t.status !== "completed").length > 0 ? (
                tasks.filter(t => t.status !== "completed").map((task) => {
                  const alreadyShared = shares.some(s => s.taskId === task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => {
                        if (!friendName.trim()) return;
                        handleShareTask(task.id, task.title);
                      }}
                      disabled={alreadyShared || !friendName.trim()}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        alreadyShared
                          ? "border-accent-200 bg-accent-50/50 opacity-60"
                          : "border-surface-200 hover:border-brand-300 hover:shadow-sm bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        alreadyShared ? "bg-accent-100" : "bg-surface-100"
                      )}>
                        {alreadyShared ? (
                          <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{task.title}</p>
                        <p className="text-xs text-surface-400">{task.priority} priority</p>
                      </div>
                      {alreadyShared && (
                        <Badge variant="success">Shared</Badge>
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-surface-400 text-center py-4">No pending tasks to share. Add some tasks first!</p>
              )}
            </div>

            {copied && (
              <div className="p-3 rounded-xl bg-accent-50 border border-accent-200 text-sm text-accent-700 animate-fade-in">
                ✅ Share link copied! Send it to your friend.
              </div>
            )}

            {!friendName.trim() && tasks.filter(t => t.status !== "completed").length > 0 && (
              <p className="text-xs text-warning-600">Enter a friend's name above to share a task</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Shares */}
      {activeShares.length > 0 && (
        <div>
          <h2 className="font-semibold text-surface-900 mb-4">Active Shares</h2>
          <div className="space-y-3">
            {activeShares.map((share) => {
              const task = tasks.find(t => t.id === share.taskId);
              return (
                <Card key={share.id} className="hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📋</span>
                        <div>
                          <h3 className="font-semibold text-surface-900">{share.taskTitle}</h3>
                          <p className="text-xs text-surface-400">
                            Shared with <strong className="text-surface-600">{share.friendName}</strong>
                            {share.friendEmail && ` · ${share.friendEmail}`}
                          </p>
                        </div>
                      </div>

                      {/* Encouragement messages */}
                      {share.encouragementMessages.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                            Encouragement Received
                          </p>
                          {share.encouragementMessages.map((msg, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-brand-50 border border-brand-100">
                              <span className="text-lg">💬</span>
                              <div>
                                <p className="text-sm text-surface-700">
                                  <strong className="text-brand-700">{msg.from}:</strong> "{msg.message}"
                                </p>
                                <p className="text-xs text-surface-400 mt-0.5">
                                  {new Date(msg.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-3">
                        {task && task.status !== "completed" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              toggleTaskStatus(task.id);
                              updateShareStatus(share.id, "completed");
                            }}
                          >
                            ✓ Complete Task
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedShare(share.id);
                            setEncourageModalOpen(true);
                          }}
                        >
                          💬 Send Encouragement
                        </Button>
                        <button
                          onClick={() => removeShare(share.id)}
                          className="text-xs text-surface-400 hover:text-danger-500"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Share link */}
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(share.shareLink);
                          }}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          🔗 Copy share link
                        </button>
                      </div>
                    </div>
                    <Badge variant={share.status === "watched" ? "info" : "warning"}>
                      {share.status === "watched" ? "Being watched" : "Pending"}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Shares */}
      {completedShares.length > 0 && (
        <div>
          <h2 className="font-semibold text-surface-900 mb-4">Completed 🎉</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {completedShares.map((share) => (
              <Card key={share.id} className="border-accent-200 bg-gradient-to-r from-accent-50/30 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                    <span className="text-xl">✅</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">{share.taskTitle}</p>
                    <p className="text-xs text-surface-400">Watched by {share.friendName}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {shares.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <p className="text-surface-400 font-medium">No tasks shared yet</p>
              <p className="text-sm text-surface-300 mt-1 max-w-md mx-auto">
                Share a task with a friend above. Tasks shared with accountability partners have a <strong>65% higher completion rate</strong>!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Encouragement Modal */}
      <Modal
        isOpen={encourageModalOpen}
        onClose={() => { setEncourageModalOpen(false); setEncourageMessage(""); }}
        title="💬 Send Encouragement"
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-500">
            Send a motivational message to encourage your friend to complete their task!
          </p>
          <textarea
            value={encourageMessage}
            onChange={(e) => setEncourageMessage(e.target.value)}
            placeholder="e.g., You've got this! Just 5 more minutes 💪"
            rows={3}
            className="w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none resize-none"
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setEncourageModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSendEncouragement} disabled={!encourageMessage.trim()} className="flex-1">
              Send 💪
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "You've got this! 💪",
              "Just start — 5 minutes is all you need! 🚀",
              "I believe in you! 🌟",
              "One step at a time! 👣",
              "You're unstoppable! 🔥",
            ].map((msg) => (
              <button
                key={msg}
                onClick={() => setEncourageMessage(msg)}
                className="px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-200 text-xs text-surface-600 hover:bg-surface-100 transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
