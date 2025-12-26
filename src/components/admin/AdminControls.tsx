"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import {
  Play, Pause, RotateCcw, Square, Save, RefreshCw, Clock, History,
  CheckCircle, XCircle, Eye, LogOut, Plus, Trash2, Calendar, Timer,
} from "lucide-react";
import { useCountdownAdmin } from "@/hooks/useCountdown";
import { CountdownLog, ScheduledPause, parseDuration, formatDuration } from "@/types/countdown";

interface AdminControlsProps {
  onLogout?: () => void;
}

export default function AdminControls({ onLogout }: AdminControlsProps) {
  const {
    countdown, loading, saving, error, refetch, start, pause, resume, reset, end, updateSettings, performAction,
  } = useCountdownAdmin();

  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTimeInput, setStartTimeInput] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [theme, setTheme] = useState(countdown.theme);
  const [logs, setLogs] = useState<CountdownLog[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Scheduled pause form
  const [scheduledPauses, setScheduledPauses] = useState<ScheduledPause[]>([]);
  const [newPauseReason, setNewPauseReason] = useState("");
  const [newPauseTimeType, setNewPauseTimeType] = useState<"absolute" | "offset">("offset");
  const [newPauseTime, setNewPauseTime] = useState("");
  const [newPauseOffset, setNewPauseOffset] = useState("");
  const [newPauseDuration, setNewPauseDuration] = useState("30m");

  useEffect(() => {
    if (countdown) {
      setEventName(countdown.eventName);
      setMessage(countdown.message);
      setShowMessage(countdown.showMessage);
      setTheme(countdown.theme);
      setScheduledPauses(countdown.scheduledPauses || []);
      setDurationInput(formatDuration(countdown.duration));
      
      if (countdown.startTime) {
        const date = new Date(countdown.startTime);
        setStartDate(date.toISOString().split("T")[0]);
        setStartTimeInput(date.toTimeString().slice(0, 5));
      }
    }
  }, [countdown]);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch("/api/countdown/logs");
      if (response.ok) setLogs(await response.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const notify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = async (action: () => Promise<unknown>, msg: string) => {
    try {
      await action();
      notify("success", msg);
      fetchLogs();
    } catch {
      notify("error", "Action failed");
    }
  };

  const handleSave = async () => {
    const startDateTime = new Date(`${startDate}T${startTimeInput}`);
    const duration = parseDuration(durationInput) || countdown.duration;
    
    await handleAction(
      () => updateSettings({ eventName, startTime: startDateTime, duration, message, showMessage, theme, scheduledPauses }),
      "Saved!"
    );
  };

  const addScheduledPause = () => {
    const duration = parseDuration(newPauseDuration);
    if (!duration || !newPauseReason) return notify("error", "Fill all fields");
    
    const newPause: ScheduledPause = {
      id: Date.now().toString(),
      reason: newPauseReason,
      startTime: newPauseTimeType === "absolute" && newPauseTime ? new Date(`${startDate}T${newPauseTime}`) : null,
      startOffset: newPauseTimeType === "offset" ? parseDuration(newPauseOffset) : null,
      duration,
      executed: false,
    };
    
    if (newPauseTimeType === "offset" && !newPause.startOffset) return notify("error", "Invalid offset");
    if (newPauseTimeType === "absolute" && !newPause.startTime) return notify("error", "Invalid time");
    
    setScheduledPauses([...scheduledPauses, newPause]);
    setNewPauseReason("");
    setNewPauseTime("");
    setNewPauseOffset("");
    setNewPauseDuration("30m");
  };

  const removeScheduledPause = (id: string) => {
    setScheduledPauses(scheduledPauses.filter(p => p.id !== id));
  };

  const executePause = async (pause: ScheduledPause) => {
    await handleAction(() => performAction("pause", { reason: pause.reason }), `Paused: ${pause.reason}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  const statusColor = {
    not_started: "bg-zinc-600", running: "bg-emerald-500", paused: "bg-amber-500", ended: "bg-red-500",
  }[countdown.status];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={twMerge(
              "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium",
              notification.type === "success" ? "bg-emerald-500" : "bg-red-500"
            )}
          >
            {notification.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Bashaway</h1>
            <span className={twMerge("px-2 py-0.5 rounded text-xs font-medium uppercase", statusColor)}>
              {countdown.status.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refetch} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <a href="/" target="_blank" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
            </a>
            {onLogout && (
              <button onClick={onLogout} className="p-2 hover:bg-zinc-800 rounded-lg text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Quick Controls */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Controls</h2>
          <div className="flex flex-wrap gap-3">
            {countdown.status === "not_started" && (
              <button
                onClick={() => handleAction(start, "Started!")}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> Start Event
              </button>
            )}
            {countdown.status === "running" && (
              <>
                <button
                  onClick={() => handleAction(() => pause(pauseReason || "Manual pause"), "Paused!")}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
                <input
                  type="text"
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  placeholder="Pause reason (optional)"
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm flex-1 min-w-[200px] focus:outline-none focus:border-zinc-600"
                />
              </>
            )}
            {countdown.status === "paused" && (
              <button
                onClick={() => handleAction(resume, "Resumed!")}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> Resume
              </button>
            )}
            <button
              onClick={() => handleAction(reset, "Reset!")}
              disabled={saving || countdown.status === "not_started"}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={() => handleAction(end, "Ended!")}
              disabled={saving || countdown.status === "ended"}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Square className="w-4 h-4" /> End
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Settings */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Event Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Event Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={startTimeInput}
                    onChange={(e) => setStartTimeInput(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Duration (e.g., 6h, 3h 30m, 180m)</label>
                <input
                  type="text"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  placeholder="6h"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs text-zinc-500 mb-1.5">
                  <input
                    type="checkbox"
                    checked={showMessage}
                    onChange={(e) => setShowMessage(e.target.checked)}
                    className="rounded"
                  />
                  Show Message
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message to display"
                  disabled={!showMessage}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                />
              </div>
            </div>
          </section>

          {/* Theme */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Theme</h2>
            <div className="space-y-3">
              {[
                { key: "primaryColor", label: "Primary" },
                { key: "backgroundColor", label: "Background" },
                { key: "textColor", label: "Text" },
                { key: "accentColor", label: "Accent" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme[key as keyof typeof theme]}
                    onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-zinc-700"
                  />
                  <span className="text-sm text-zinc-400 w-20">{label}</span>
                  <input
                    type="text"
                    value={theme[key as keyof typeof theme]}
                    onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                    className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono focus:outline-none focus:border-zinc-600"
                  />
                </div>
              ))}
            </div>
            {/* Mini Preview */}
            <div
              className="mt-4 p-4 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: theme.backgroundColor }}
            >
              <span className="text-2xl font-bold font-mono" style={{ color: theme.textColor }}>
                12:34:56
              </span>
            </div>
          </section>
        </div>

        {/* Scheduled Pauses */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Scheduled Pauses
          </h2>
          
          {/* Add new pause */}
          <div className="flex flex-wrap gap-3 mb-4 p-3 bg-zinc-800/50 rounded-lg">
            <input
              type="text"
              value={newPauseReason}
              onChange={(e) => setNewPauseReason(e.target.value)}
              placeholder="Reason (e.g., Lunch Break)"
              className="flex-1 min-w-[150px] px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
            />
            <select
              value={newPauseTimeType}
              onChange={(e) => setNewPauseTimeType(e.target.value as "absolute" | "offset")}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
            >
              <option value="offset">After start</option>
              <option value="absolute">At time</option>
            </select>
            {newPauseTimeType === "offset" ? (
              <input
                type="text"
                value={newPauseOffset}
                onChange={(e) => setNewPauseOffset(e.target.value)}
                placeholder="e.g., 3h"
                className="w-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
              />
            ) : (
              <input
                type="time"
                value={newPauseTime}
                onChange={(e) => setNewPauseTime(e.target.value)}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
              />
            )}
            <input
              type="text"
              value={newPauseDuration}
              onChange={(e) => setNewPauseDuration(e.target.value)}
              placeholder="Duration"
              className="w-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600"
            />
            <button
              onClick={addScheduledPause}
              className="flex items-center gap-1 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* List */}
          {scheduledPauses.length === 0 ? (
            <p className="text-zinc-500 text-sm">No scheduled pauses</p>
          ) : (
            <div className="space-y-2">
              {scheduledPauses.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <Timer className="w-4 h-4 text-zinc-500" />
                  <span className="font-medium text-sm">{p.reason}</span>
                  <span className="text-xs text-zinc-500">
                    {p.startOffset ? `+${formatDuration(p.startOffset)}` : p.startTime ? new Date(p.startTime).toLocaleTimeString() : ""}
                  </span>
                  <span className="text-xs text-zinc-500">for {formatDuration(p.duration)}</span>
                  {p.executed && <span className="text-xs text-emerald-400">✓ Done</span>}
                  <div className="flex-1" />
                  {!p.executed && countdown.status === "running" && (
                    <button
                      onClick={() => executePause(p)}
                      className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition-colors"
                    >
                      Execute Now
                    </button>
                  )}
                  <button
                    onClick={() => removeScheduledPause(p.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> Save All Changes
        </button>

        {/* Current Status & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Current Status
            </h2>
            <div className="space-y-2 text-sm">
              {[
                ["Status", <span key="s" className={twMerge("px-2 py-0.5 rounded text-xs font-medium", statusColor)}>{countdown.status.replace("_", " ")}</span>],
                ["Start Time", new Date(countdown.startTime).toLocaleString()],
                ["Duration", formatDuration(countdown.duration)],
                countdown.startedAt && ["Started At", new Date(countdown.startedAt).toLocaleString()],
                countdown.isPaused && ["Paused At", countdown.pausedAt ? new Date(countdown.pausedAt).toLocaleString() : "-"],
                countdown.isPaused && ["Pause Reason", <span key="pr" className="text-amber-400">{countdown.pauseReason}</span>],
                ["Total Paused", formatDuration(countdown.totalPausedDuration)],
              ].filter(Boolean).map((row, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                  <span className="text-zinc-500">{(row as [string, React.ReactNode])[0]}</span>
                  <span className="font-mono">{(row as [string, React.ReactNode])[1]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="w-4 h-4" /> Activity Log
            </h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-zinc-500 text-sm">No activity yet</p>
              ) : (
                logs.slice(0, 20).map((log, i) => (
                  <div key={log._id || i} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
                    <div className={twMerge(
                      "w-2 h-2 rounded-full",
                      log.action === "start" && "bg-emerald-500",
                      log.action === "pause" && "bg-amber-500",
                      log.action === "resume" && "bg-blue-500",
                      log.action === "end" && "bg-red-500",
                      log.action === "reset" && "bg-zinc-500",
                      log.action === "update" && "bg-purple-500",
                    )} />
                    <span className="text-sm capitalize">{log.action}</span>
                    {log.reason && <span className="text-xs text-zinc-500">({log.reason})</span>}
                    <span className="flex-1" />
                    <span className="text-xs text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
