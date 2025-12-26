"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import {
  Play, Pause, RotateCcw, Square, Save, RefreshCw, Clock, History,
  CheckCircle, XCircle, Eye, LogOut, Plus, Trash2, Settings, Palette,
  Layout, Type, Calendar, Timer, Sliders,
} from "lucide-react";
import { useCountdownAdmin } from "@/hooks/useCountdown";
import { 
  CountdownLog, ScheduledPause, parseDuration, formatDuration,
  DEFAULT_STATUS_STYLES, DEFAULT_DISPLAY_CONFIG, DEFAULT_FONT_CONFIG,
  StatusStyle, DisplayConfig, FontConfig,
} from "@/types/countdown";

// UI Components
function Card({ title, icon, children, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge("bg-zinc-900 border border-zinc-800 rounded-xl p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-red-500">{icon}</span>
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, disabled, className }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-zinc-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <div>
        <span className="text-sm text-zinc-300">{label}</span>
        {description && <p className="text-xs text-zinc-500">{description}</p>}
      </div>
      <div
        className={twMerge(
          "w-10 h-6 rounded-full transition-colors relative",
          checked ? "bg-red-500" : "bg-zinc-700"
        )}
        onClick={() => onChange(!checked)}
      >
        <div
          className={twMerge(
            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
            checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </div>
    </label>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-zinc-700 bg-transparent"
      />
      <span className="text-xs text-zinc-400 w-24">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono focus:outline-none focus:border-zinc-600"
      />
    </div>
  );
}

interface AdminControlsProps {
  onLogout?: () => void;
}

export default function AdminControls({ onLogout }: AdminControlsProps) {
  const {
    countdown, loading, saving, error, refetch, start, pause, resume, reset, end, updateSettings, performAction,
  } = useCountdownAdmin();

  const [activeTab, setActiveTab] = useState<"controls" | "display" | "theme" | "fonts" | "schedule" | "logs">("controls");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTimeInput, setStartTimeInput] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [message, setMessage] = useState("");
  const [pauseReason, setPauseReason] = useState("");
  
  // Theme
  const [theme, setTheme] = useState(countdown.theme);
  const [statusStyles, setStatusStyles] = useState(countdown.statusStyles || DEFAULT_STATUS_STYLES);
  
  // Display
  const [display, setDisplay] = useState<DisplayConfig>(countdown.display || DEFAULT_DISPLAY_CONFIG);
  
  // Fonts
  const [fonts, setFonts] = useState<FontConfig>(countdown.fonts || DEFAULT_FONT_CONFIG);
  
  // Progress bar
  const [progressBar, setProgressBar] = useState(countdown.progressBar || {
    height: 6, borderRadius: 3, showLabels: true, backgroundColor: "rgba(255,255,255,0.1)", fillColor: "#EF4444"
  });
  
  // Scheduled pauses
  const [scheduledPauses, setScheduledPauses] = useState<ScheduledPause[]>([]);
  const [newPauseReason, setNewPauseReason] = useState("");
  const [newPauseTimeType, setNewPauseTimeType] = useState<"absolute" | "offset">("offset");
  const [newPauseTime, setNewPauseTime] = useState("");
  const [newPauseOffset, setNewPauseOffset] = useState("");
  const [newPauseDuration, setNewPauseDuration] = useState("30m");
  
  // Logs
  const [logs, setLogs] = useState<CountdownLog[]>([]);

  // Sync form state
  useEffect(() => {
    if (countdown) {
      setEventName(countdown.eventName || "Bashaway 2025");
      setMessage(countdown.message || "");
      setTheme(countdown.theme || { primaryColor: "#EF4444", backgroundColor: "#0a0a0a", textColor: "#FFFFFF", accentColor: "#F59E0B" });
      setStatusStyles(countdown.statusStyles || DEFAULT_STATUS_STYLES);
      setDisplay(countdown.display || DEFAULT_DISPLAY_CONFIG);
      setFonts(countdown.fonts || DEFAULT_FONT_CONFIG);
      setProgressBar(countdown.progressBar || { height: 6, borderRadius: 3, showLabels: true, backgroundColor: "rgba(255,255,255,0.1)", fillColor: "#EF4444" });
      setScheduledPauses(countdown.scheduledPauses || []);
      setDurationInput(formatDuration(countdown.duration || 6 * 60 * 60 * 1000));
      
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
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const notify = (type: "success" | "error", msg: string) => {
    setNotification({ type, message: msg });
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
      () => updateSettings({
        eventName,
        startTime: startDateTime,
        duration,
        message,
        theme,
        statusStyles,
        display,
        fonts,
        progressBar,
        scheduledPauses,
      }),
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
  };

  const updateStatusStyle = (status: keyof typeof statusStyles, field: keyof StatusStyle, value: string) => {
    setStatusStyles({
      ...statusStyles,
      [status]: { ...statusStyles[status], [field]: value },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "controls", label: "Controls", icon: <Play className="w-4 h-4" /> },
    { id: "display", label: "Display", icon: <Layout className="w-4 h-4" /> },
    { id: "theme", label: "Theme", icon: <Palette className="w-4 h-4" /> },
    { id: "fonts", label: "Fonts & Style", icon: <Type className="w-4 h-4" /> },
    { id: "schedule", label: "Schedule", icon: <Calendar className="w-4 h-4" /> },
    { id: "logs", label: "Logs", icon: <History className="w-4 h-4" /> },
  ];

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
              "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium shadow-xl",
              notification.type === "success" ? "bg-emerald-500" : "bg-red-500"
            )}
          >
            {notification.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Bashaway Admin</h1>
            <span className={twMerge("px-2.5 py-1 rounded text-xs font-semibold uppercase", statusColor)}>
              {countdown.status.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refetch} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <a href="/" target="_blank" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="View Display">
              <Eye className="w-4 h-4" />
            </a>
            {onLogout && (
              <button onClick={onLogout} className="p-2 hover:bg-zinc-800 rounded-lg text-red-400 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 py-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={twMerge(
                  "px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap",
                  activeTab === tab.id ? "bg-red-500/10 text-red-500" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* CONTROLS TAB */}
          {activeTab === "controls" && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <Card title="Quick Actions" icon={<Play className="w-4 h-4" />}>
                <div className="flex flex-wrap gap-3 mb-4">
                  {countdown.status === "not_started" && (
                    <button
                      onClick={() => handleAction(start, "Started!")}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" /> Start Event
                    </button>
                  )}
                  {countdown.status === "running" && (
                    <button
                      onClick={() => handleAction(() => pause(pauseReason || "Manual pause"), "Paused!")}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                  )}
                  {countdown.status === "paused" && (
                    <button
                      onClick={() => handleAction(resume, "Resumed!")}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" /> Resume
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(reset, "Reset!")}
                    disabled={saving || countdown.status === "not_started"}
                    className="flex items-center gap-2 px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                  <button
                    onClick={() => handleAction(end, "Ended!")}
                    disabled={saving || countdown.status === "ended"}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    <Square className="w-4 h-4" /> End Event
                  </button>
                </div>
                {countdown.status === "running" && (
                  <Input
                    label="Pause Reason"
                    value={pauseReason}
                    onChange={setPauseReason}
                    placeholder="e.g., Lunch Break, Technical Issue"
                  />
                )}
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event Settings */}
                <Card title="Event Settings" icon={<Settings className="w-4 h-4" />}>
                  <div className="space-y-4">
                    <Input label="Event Name" value={eventName} onChange={setEventName} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Start Date" type="date" value={startDate} onChange={setStartDate} />
                      <Input label="Start Time" type="time" value={startTimeInput} onChange={setStartTimeInput} />
                    </div>
                    <Input label="Duration (e.g., 6h, 3h 30m)" value={durationInput} onChange={setDurationInput} placeholder="6h" />
                    <Input label="Display Message" value={message} onChange={setMessage} placeholder="Optional message" />
                  </div>
                </Card>

                {/* Current Status */}
                <Card title="Current Status" icon={<Clock className="w-4 h-4" />}>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Status", <span key="s" className={twMerge("px-2 py-0.5 rounded text-xs font-semibold uppercase", statusColor)}>{countdown.status.replace("_", " ")}</span>],
                      ["Start Time", new Date(countdown.startTime).toLocaleString()],
                      ["Duration", formatDuration(countdown.duration)],
                      countdown.startedAt && ["Started At", new Date(countdown.startedAt).toLocaleString()],
                      countdown.isPaused && countdown.pausedAt && ["Paused At", new Date(countdown.pausedAt).toLocaleString()],
                      countdown.isPaused && ["Pause Reason", <span key="pr" className="text-amber-400">{countdown.pauseReason}</span>],
                      ["Total Paused", formatDuration(countdown.totalPausedDuration)],
                    ].filter(Boolean).map((row, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                        <span className="text-zinc-500">{(row as [string, React.ReactNode])[0]}</span>
                        <span className="font-mono text-right">{(row as [string, React.ReactNode])[1]}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </motion.div>
          )}

          {/* DISPLAY TAB */}
          {activeTab === "display" && (
            <motion.div
              key="display"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Element Visibility" icon={<Eye className="w-4 h-4" />}>
                  <div className="space-y-1">
                    <Toggle label="Show Logo" checked={display.showLogo} onChange={(v) => setDisplay({ ...display, showLogo: v })} />
                    <Toggle label="Show Event Name" checked={display.showEventName} onChange={(v) => setDisplay({ ...display, showEventName: v })} />
                    <Toggle label="Show Status Badge" checked={display.showStatus} onChange={(v) => setDisplay({ ...display, showStatus: v })} />
                    <Toggle label="Show Timer" checked={display.showTimer} onChange={(v) => setDisplay({ ...display, showTimer: v })} />
                    <Toggle label="Show Progress Bar" checked={display.showProgressBar} onChange={(v) => setDisplay({ ...display, showProgressBar: v })} />
                    <Toggle label="Show Message" checked={display.showMessage} onChange={(v) => setDisplay({ ...display, showMessage: v })} />
                    <Toggle label="Show Started At" checked={display.showStartedAt} onChange={(v) => setDisplay({ ...display, showStartedAt: v })} />
                    <Toggle label="Show End Time" checked={display.showEndTime} onChange={(v) => setDisplay({ ...display, showEndTime: v })} />
                    <Toggle label="Show Elapsed Time" checked={display.showElapsed} onChange={(v) => setDisplay({ ...display, showElapsed: v })} />
                    <Toggle label="Show Footer" checked={display.showFooter} onChange={(v) => setDisplay({ ...display, showFooter: v })} />
                  </div>
                </Card>

                <Card title="Completed State" icon={<CheckCircle className="w-4 h-4" />}>
                  <div className="space-y-4">
                    <Input
                      label="Completed Title"
                      value={display.completedTitle}
                      onChange={(v) => setDisplay({ ...display, completedTitle: v })}
                      placeholder="Event Complete!"
                    />
                    <Input
                      label="Completed Subtitle"
                      value={display.completedSubtitle}
                      onChange={(v) => setDisplay({ ...display, completedSubtitle: v })}
                      placeholder="Thank you for participating"
                    />
                  </div>
                </Card>

                <Card title="Progress Bar" icon={<Sliders className="w-4 h-4" />} className="lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                      label="Height (px)"
                      type="number"
                      value={progressBar.height.toString()}
                      onChange={(v) => setProgressBar({ ...progressBar, height: parseInt(v) || 6 })}
                    />
                    <Input
                      label="Border Radius (px)"
                      type="number"
                      value={progressBar.borderRadius.toString()}
                      onChange={(v) => setProgressBar({ ...progressBar, borderRadius: parseInt(v) || 3 })}
                    />
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={progressBar.backgroundColor.startsWith("rgba") ? "#1a1a1a" : progressBar.backgroundColor}
                          onChange={(e) => setProgressBar({ ...progressBar, backgroundColor: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer border border-zinc-700"
                        />
                        <input
                          type="text"
                          value={progressBar.backgroundColor}
                          onChange={(e) => setProgressBar({ ...progressBar, backgroundColor: e.target.value })}
                          className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">Fill Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={progressBar.fillColor}
                          onChange={(e) => setProgressBar({ ...progressBar, fillColor: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer border border-zinc-700"
                        />
                        <input
                          type="text"
                          value={progressBar.fillColor}
                          onChange={(e) => setProgressBar({ ...progressBar, fillColor: e.target.value })}
                          className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Toggle
                      label="Show Labels"
                      checked={progressBar.showLabels}
                      onChange={(v) => setProgressBar({ ...progressBar, showLabels: v })}
                    />
                  </div>
                  {/* Preview */}
                  <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-2">Preview</p>
                    <div
                      style={{
                        height: progressBar.height,
                        borderRadius: progressBar.borderRadius,
                        backgroundColor: progressBar.backgroundColor,
                      }}
                    >
                      <div
                        style={{
                          width: "65%",
                          height: "100%",
                          borderRadius: progressBar.borderRadius,
                          backgroundColor: progressBar.fillColor,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </motion.div>
          )}

          {/* THEME TAB */}
          {activeTab === "theme" && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Base Colors" icon={<Palette className="w-4 h-4" />}>
                  <div className="space-y-4">
                    <ColorInput label="Primary" value={theme.primaryColor} onChange={(v) => setTheme({ ...theme, primaryColor: v })} />
                    <ColorInput label="Background" value={theme.backgroundColor} onChange={(v) => setTheme({ ...theme, backgroundColor: v })} />
                    <ColorInput label="Text" value={theme.textColor} onChange={(v) => setTheme({ ...theme, textColor: v })} />
                    <ColorInput label="Accent" value={theme.accentColor} onChange={(v) => setTheme({ ...theme, accentColor: v })} />
                  </div>
                </Card>

                <Card title="Preview" icon={<Eye className="w-4 h-4" />}>
                  <div
                    className="rounded-lg p-6 flex flex-col items-center"
                    style={{ backgroundColor: theme.backgroundColor }}
                  >
                    <span className="text-2xl font-bold mb-2" style={{ color: theme.textColor }}>{eventName}</span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold mb-4"
                      style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
                    >
                      LIVE
                    </span>
                    <span className="text-4xl font-mono font-bold" style={{ color: theme.textColor }}>12:34:56</span>
                  </div>
                </Card>
              </div>

              {/* Status-specific styles */}
              <Card title="Status-Specific Styles" icon={<Sliders className="w-4 h-4" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(["not_started", "running", "paused", "ended"] as const).map((status) => (
                    <div key={status} className="p-4 bg-zinc-800/50 rounded-lg">
                      <h4 className="text-sm font-semibold capitalize mb-3 flex items-center gap-2">
                        <span className={twMerge(
                          "w-2 h-2 rounded-full",
                          status === "not_started" && "bg-zinc-500",
                          status === "running" && "bg-emerald-500",
                          status === "paused" && "bg-amber-500",
                          status === "ended" && "bg-red-500",
                        )} />
                        {status.replace("_", " ")}
                      </h4>
                      <div className="space-y-3">
                        <ColorInput
                          label="Badge BG"
                          value={statusStyles[status].badgeColor}
                          onChange={(v) => updateStatusStyle(status, "badgeColor", v)}
                        />
                        <ColorInput
                          label="Badge Text"
                          value={statusStyles[status].badgeTextColor}
                          onChange={(v) => updateStatusStyle(status, "badgeTextColor", v)}
                        />
                        <ColorInput
                          label="Border"
                          value={statusStyles[status].borderColor}
                          onChange={(v) => updateStatusStyle(status, "borderColor", v)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </motion.div>
          )}

          {/* FONTS TAB */}
          {activeTab === "fonts" && (
            <motion.div
              key="fonts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <Card title="Font Families" icon={<Type className="w-4 h-4" />}>
                <div className="space-y-4">
                  <Input
                    label="Event Name Font"
                    value={fonts.eventName}
                    onChange={(v) => setFonts({ ...fonts, eventName: v })}
                    placeholder="system-ui, sans-serif"
                  />
                  <Input
                    label="Timer Font"
                    value={fonts.timer}
                    onChange={(v) => setFonts({ ...fonts, timer: v })}
                    placeholder="'SF Mono', monospace"
                  />
                  <Input
                    label="Labels Font"
                    value={fonts.labels}
                    onChange={(v) => setFonts({ ...fonts, labels: v })}
                    placeholder="system-ui, sans-serif"
                  />
                  <Input
                    label="Message Font"
                    value={fonts.message}
                    onChange={(v) => setFonts({ ...fonts, message: v })}
                    placeholder="system-ui, sans-serif"
                  />
                </div>
                <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-3">Preview</p>
                  <p className="text-2xl font-bold mb-2" style={{ fontFamily: fonts.eventName }}>Event Name</p>
                  <p className="text-4xl font-bold mb-2" style={{ fontFamily: fonts.timer }}>12:34:56</p>
                  <p className="text-sm uppercase tracking-wider mb-2" style={{ fontFamily: fonts.labels }}>HOURS MINUTES SECONDS</p>
                  <p className="text-base" style={{ fontFamily: fonts.message }}>This is a sample message</p>
                </div>
              </Card>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </motion.div>
          )}

          {/* SCHEDULE TAB */}
          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <Card title="Scheduled Pauses" icon={<Calendar className="w-4 h-4" />}>
                <div className="flex flex-wrap gap-3 mb-4 p-4 bg-zinc-800/50 rounded-lg">
                  <input
                    type="text"
                    value={newPauseReason}
                    onChange={(e) => setNewPauseReason(e.target.value)}
                    placeholder="Reason (e.g., Lunch Break)"
                    className="flex-1 min-w-[150px] px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm"
                  />
                  <select
                    value={newPauseTimeType}
                    onChange={(e) => setNewPauseTimeType(e.target.value as "absolute" | "offset")}
                    className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm"
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
                      className="w-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm"
                    />
                  ) : (
                    <input
                      type="time"
                      value={newPauseTime}
                      onChange={(e) => setNewPauseTime(e.target.value)}
                      className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm"
                    />
                  )}
                  <input
                    type="text"
                    value={newPauseDuration}
                    onChange={(e) => setNewPauseDuration(e.target.value)}
                    placeholder="Duration (30m)"
                    className="w-28 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm"
                  />
                  <button
                    onClick={addScheduledPause}
                    className="flex items-center gap-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {scheduledPauses.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-4">No scheduled pauses</p>
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
                            onClick={() => handleAction(() => performAction("pause", { reason: p.reason }), `Paused: ${p.reason}`)}
                            className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30"
                          >
                            Execute Now
                          </button>
                        )}
                        <button
                          onClick={() => setScheduledPauses(scheduledPauses.filter(x => x.id !== p.id))}
                          className="p-1 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </motion.div>
          )}

          {/* LOGS TAB */}
          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card title="Activity Log" icon={<History className="w-4 h-4" />}>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-zinc-500 text-sm text-center py-8">No activity yet</p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={log._id || i} className="flex items-center gap-3 py-3 border-b border-zinc-800 last:border-0">
                        <div className={twMerge(
                          "w-2 h-2 rounded-full",
                          log.action === "start" && "bg-emerald-500",
                          log.action === "pause" && "bg-amber-500",
                          log.action === "resume" && "bg-blue-500",
                          log.action === "end" && "bg-red-500",
                          log.action === "reset" && "bg-zinc-500",
                          log.action === "update" && "bg-purple-500",
                        )} />
                        <span className="text-sm capitalize font-medium">{log.action}</span>
                        {log.reason && <span className="text-xs text-zinc-500">({log.reason})</span>}
                        <span className="flex-1" />
                        <span className="text-xs text-zinc-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
