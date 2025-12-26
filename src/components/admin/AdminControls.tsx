"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import {
  Play, Pause, RotateCcw, Square, RefreshCw, Clock, History,
  CheckCircle, XCircle, Eye, LogOut, Settings, Palette, Layout, Type, X,
} from "lucide-react";
import { useCountdownAdmin } from "@/hooks/useCountdown";
import { 
  CountdownLog, parseDuration, formatDuration,
  DEFAULT_STATUS_STYLES, DEFAULT_DISPLAY_CONFIG, DEFAULT_FONT_CONFIG,
  StatusStyle, DisplayConfig, FontConfig,
} from "@/types/countdown";

function Dialog({ open, onClose, title, children }: { 
  open: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
}) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white border border-black/10 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-black/60" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function BashawayInput({ label, value, onChange, type = "text", placeholder, disabled, className }: {
  label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm text-black/60 mb-1.5">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-12 bg-white border border-black/20 focus:border-black rounded-md px-4 text-base font-normal transition duration-300 outline-none disabled:opacity-50"
      />
    </div>
  );
}

function BashawayButton({ children, onClick, variant = "primary", disabled, loading, className }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary"; disabled?: boolean; loading?: boolean; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={twMerge(
        "flex justify-center items-center cursor-pointer rounded-full px-5 py-3 font-semibold outline-none transition-all duration-200 gap-2",
        variant === "primary" ? "bg-black text-white hover:bg-black/80" : "text-black bg-white border border-black/20 hover:bg-black/5",
        (disabled || loading) && "opacity-60 pointer-events-none",
        className
      )}
    >
      {loading && (
        <motion.div
          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </button>
  );
}

function BashawayDropdown({ label, value, onChange, options, className }: {
  label?: string; value: string; onChange: (v: string) => void; options: { key: string; label: string }[]; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.key === value);

  return (
    <div className={twMerge("relative", className)}>
      {label && <label className="block text-sm text-black/60 mb-1.5">{label}</label>}
      <div
        className="w-full h-12 bg-white border border-black/20 focus:border-black rounded-md px-4 text-base font-normal transition duration-300 cursor-pointer flex items-center justify-between"
        onClick={() => setOpen(!open)}
      >
        <span className={selected ? "text-black" : "text-black/50"}>{selected?.label || "Select"}</span>
        <svg className="w-4 h-4 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <div className="absolute w-full left-0 z-10 mt-2 rounded-2xl bg-white/90 backdrop-blur-lg border border-black/20 shadow-xl overflow-hidden">
          {options.map((option, index) => (
            <div
              key={option.key}
              className={twMerge(
                "px-5 py-3 cursor-pointer hover:bg-black/5 transition-all duration-150 text-black",
                index === 0 && "rounded-t-2xl",
                index === options.length - 1 && "rounded-b-2xl"
              )}
              onClick={() => { onChange(option.key); setOpen(false); }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <span className="text-sm text-black">{label}</span>
      <div
        className={twMerge(
          "w-10 h-6 rounded-full transition-colors relative",
          checked ? "bg-black" : "bg-black/20"
        )}
        onClick={() => onChange(!checked)}
      >
        <div
          className={twMerge(
            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow",
            checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </div>
    </label>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-black/10 flex-shrink-0"
      />
      <span className="text-xs text-black/60 min-w-16">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-1.5 bg-white border border-black/20 rounded text-xs font-mono focus:outline-none focus:border-black min-w-0"
      />
    </div>
  );
}

function Card({ title, icon, children, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge("bg-white border border-black/10 rounded-2xl p-5 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-black/60">{icon}</span>
        <h3 className="text-sm font-semibold text-black/80 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
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

  const [activeTab, setActiveTab] = useState<"controls" | "display" | "theme" | "fonts" | "logs">("controls");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showPauseNowDialog, setShowPauseNowDialog] = useState(false);
  const [showPauseAtDialog, setShowPauseAtDialog] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [pauseAtTime, setPauseAtTime] = useState("");

  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTimeInput, setStartTimeInput] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [message, setMessage] = useState("");
  const [pausePrefix, setPausePrefix] = useState("Paused for");
  const [theme, setTheme] = useState(countdown.theme);
  const [statusStyles, setStatusStyles] = useState(countdown.statusStyles || DEFAULT_STATUS_STYLES);
  const [display, setDisplay] = useState<DisplayConfig>(countdown.display || DEFAULT_DISPLAY_CONFIG);
  const [fonts, setFonts] = useState<FontConfig>(countdown.fonts || DEFAULT_FONT_CONFIG);
  const [progressBar, setProgressBar] = useState(countdown.progressBar || {
    height: 6, borderRadius: 3, showLabels: true, backgroundColor: "rgba(255,255,255,0.1)", fillColor: "#EF4444"
  });
  const [logs, setLogs] = useState<CountdownLog[]>([]);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasUserChanges = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (countdown && !isInitialized.current) {
      setEventName(countdown.eventName || "Bashaway 2025");
      setMessage(countdown.message || "");
      setPausePrefix(countdown.pausePrefix || "Paused for");
      setTheme(countdown.theme || { primaryColor: "#EF4444", backgroundColor: "#0a0a0a", textColor: "#FFFFFF", accentColor: "#F59E0B" });
      setStatusStyles(countdown.statusStyles || DEFAULT_STATUS_STYLES);
      setDisplay(countdown.display || DEFAULT_DISPLAY_CONFIG);
      setFonts(countdown.fonts || DEFAULT_FONT_CONFIG);
      setProgressBar(countdown.progressBar || { height: 6, borderRadius: 3, showLabels: true, backgroundColor: "rgba(255,255,255,0.1)", fillColor: "#EF4444" });
      setDurationInput(formatDuration(countdown.duration || 6 * 60 * 60 * 1000));
      
      if (countdown.startTime) {
        const date = new Date(countdown.startTime);
        setStartDate(date.toISOString().split("T")[0]);
        setStartTimeInput(date.toTimeString().slice(0, 5));
      }
      isInitialized.current = true;
    }
  }, [countdown]);

  const triggerAutoSave = useCallback(() => {
    hasUserChanges.current = true;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (!hasUserChanges.current) return;
      
      const startDateTime = startDate && startTimeInput ? new Date(`${startDate}T${startTimeInput}`) : countdown.startTime;
      const duration = parseDuration(durationInput) || countdown.duration;
      
      try {
        await updateSettings({
          eventName,
          startTime: startDateTime,
          duration,
          message,
          pausePrefix,
          theme,
          statusStyles,
          display,
          fonts,
          progressBar,
        });
        hasUserChanges.current = false;
      } catch {}
    }, 1500);
  }, [eventName, startDate, startTimeInput, durationInput, message, pausePrefix, theme, statusStyles, display, fonts, progressBar, countdown.startTime, countdown.duration, updateSettings]);

  const handleFieldChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    setter(value);
    triggerAutoSave();
  };

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch("/api/countdown/logs");
      if (response.ok) setLogs(await response.json());
    } catch {}
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

  const handlePauseNow = async () => {
    await handleAction(() => pause(pauseReason || "Manual pause"), "Paused!");
    setShowPauseNowDialog(false);
    setPauseReason("");
  };

  const handleSchedulePause = async () => {
    if (!pauseAtTime) {
      notify("error", "Please select a time");
      return;
    }
    
    const now = new Date();
    const [hours, minutes] = pauseAtTime.split(":").map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    await handleAction(
      () => performAction("schedule_pause", { 
        pauseAt: scheduledTime.toISOString(),
        reason: pauseReason 
      }),
      `Pause scheduled for ${scheduledTime.toLocaleTimeString()}`
    );
    setShowPauseAtDialog(false);
    setPauseReason("");
    setPauseAtTime("");
  };

  const handleCancelScheduledPause = async () => {
    await handleAction(
      () => performAction("cancel_scheduled_pause", {}),
      "Scheduled pause cancelled"
    );
  };

  const updateStatusStyle = (status: keyof typeof statusStyles, field: keyof StatusStyle, value: string) => {
    const newStyles = {
      ...statusStyles,
      [status]: { ...statusStyles[status], [field]: value },
    };
    setStatusStyles(newStyles);
    triggerAutoSave();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-black animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "controls", label: "Controls", icon: <Play className="w-4 h-4" /> },
    { id: "display", label: "Display", icon: <Layout className="w-4 h-4" /> },
    { id: "theme", label: "Theme", icon: <Palette className="w-4 h-4" /> },
    { id: "fonts", label: "Fonts", icon: <Type className="w-4 h-4" /> },
    { id: "logs", label: "Logs", icon: <History className="w-4 h-4" /> },
  ];

  const statusColors: Record<string, string> = {
    not_started: "bg-gray-400", running: "bg-green-500", paused: "bg-amber-500", ended: "bg-red-500",
  };

  const pausePrefixOptions = [
    { key: "Paused for", label: "Paused for" },
    { key: "Paused due to", label: "Paused due to" },
    { key: "On break:", label: "On break:" },
    { key: "Break -", label: "Break -" },
    { key: "", label: "No prefix" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Dialog open={showPauseNowDialog} onClose={() => setShowPauseNowDialog(false)} title="Pause Now">
        <div className="space-y-4">
          <BashawayInput
            label="Reason for pause"
            value={pauseReason}
            onChange={setPauseReason}
            placeholder="e.g., Lunch Break"
          />
          <div className="flex gap-3 pt-2">
            <BashawayButton variant="secondary" onClick={() => setShowPauseNowDialog(false)} className="flex-1">
              Cancel
            </BashawayButton>
            <BashawayButton onClick={handlePauseNow} loading={saving} className="flex-1">
              Pause Now
            </BashawayButton>
          </div>
        </div>
      </Dialog>

      <Dialog open={showPauseAtDialog} onClose={() => setShowPauseAtDialog(false)} title="Schedule Pause">
        <div className="space-y-4">
          <BashawayInput
            label="Pause at time"
            type="time"
            value={pauseAtTime}
            onChange={setPauseAtTime}
          />
          <BashawayInput
            label="Reason for pause"
            value={pauseReason}
            onChange={setPauseReason}
            placeholder="e.g., Lunch Break"
          />
          <div className="flex gap-3 pt-2">
            <BashawayButton variant="secondary" onClick={() => setShowPauseAtDialog(false)} className="flex-1">
              Cancel
            </BashawayButton>
            <BashawayButton onClick={handleSchedulePause} loading={saving} disabled={!pauseAtTime} className="flex-1">
              Schedule
            </BashawayButton>
          </div>
        </div>
      </Dialog>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={twMerge(
              "fixed top-4 right-4 z-50 px-4 py-3 rounded-full flex items-center gap-2 text-sm font-semibold shadow-xl",
              notification.type === "success" ? "bg-black text-white" : "bg-red-500 text-white"
            )}
          >
            {notification.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b border-black/10 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Bashaway Admin</h1>
            <span className={twMerge("px-3 py-1 rounded-full text-xs font-semibold uppercase text-white", statusColors[countdown.status])}>
              {countdown.status.replace("_", " ")}
            </span>
            {countdown.scheduledPauseAt && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  Pause at {new Date(countdown.scheduledPauseAt).toLocaleTimeString()}
                </span>
                <button
                  onClick={handleCancelScheduledPause}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500"
                  title="Cancel scheduled pause"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {saving && <span className="text-xs text-black/50">Saving...</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refetch} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <a href="/" target="_blank" className="p-2 hover:bg-black/5 rounded-full transition-colors" title="View Display">
              <Eye className="w-4 h-4" />
            </a>
            {onLogout && (
              <button onClick={onLogout} className="p-2 hover:bg-black/5 rounded-full text-red-500 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="border-b border-black/10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 py-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={twMerge(
                  "px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap",
                  activeTab === tab.id ? "bg-black text-white" : "text-black/60 hover:text-black hover:bg-black/5"
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "controls" && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <Card title="Quick Actions" icon={<Play className="w-4 h-4" />}>
                <div className="flex flex-wrap gap-3">
                  {countdown.status === "not_started" && (
                    <BashawayButton onClick={() => handleAction(start, "Started!")} loading={saving}>
                      <Play className="w-4 h-4" /> Start Event
                    </BashawayButton>
                  )}
                  {countdown.status === "running" && (
                    <>
                      <BashawayButton onClick={() => setShowPauseNowDialog(true)}>
                        <Pause className="w-4 h-4" /> Pause Now
                      </BashawayButton>
                      <BashawayButton variant="secondary" onClick={() => setShowPauseAtDialog(true)}>
                        <Clock className="w-4 h-4" /> Pause At...
                      </BashawayButton>
                    </>
                  )}
                  {countdown.status === "paused" && (
                    <BashawayButton onClick={() => handleAction(resume, "Resumed!")} loading={saving}>
                      <Play className="w-4 h-4" /> Resume
                    </BashawayButton>
                  )}
                  <BashawayButton
                    variant="secondary"
                    onClick={() => handleAction(reset, "Reset!")}
                    disabled={saving || countdown.status === "not_started"}
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </BashawayButton>
                  <BashawayButton
                    variant="secondary"
                    onClick={() => handleAction(end, "Ended!")}
                    disabled={saving || countdown.status === "ended"}
                    className="!border-red-200 !text-red-600 hover:!bg-red-50"
                  >
                    <Square className="w-4 h-4" /> End Event
                  </BashawayButton>
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Event Settings" icon={<Settings className="w-4 h-4" />}>
                  <div className="space-y-4">
                    <BashawayInput label="Event Name" value={eventName} onChange={(v) => handleFieldChange(setEventName, v)} />
                    <div className="grid grid-cols-2 gap-3">
                      <BashawayInput label="Start Date" type="date" value={startDate} onChange={(v) => handleFieldChange(setStartDate, v)} />
                      <BashawayInput label="Start Time" type="time" value={startTimeInput} onChange={(v) => handleFieldChange(setStartTimeInput, v)} />
                    </div>
                    <BashawayInput label="Duration (e.g., 6h, 3h 30m)" value={durationInput} onChange={(v) => handleFieldChange(setDurationInput, v)} placeholder="6h" />
                    <BashawayInput label="Display Message" value={message} onChange={(v) => handleFieldChange(setMessage, v)} placeholder="Optional message" />
                    <BashawayDropdown
                      label="Pause Status Prefix"
                      value={pausePrefix}
                      onChange={(v) => handleFieldChange(setPausePrefix, v)}
                      options={pausePrefixOptions}
                    />
                  </div>
                </Card>

                <Card title="Current Status" icon={<Clock className="w-4 h-4" />}>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Status", <span key="s" className={twMerge("px-2 py-0.5 rounded-full text-xs font-semibold uppercase text-white", statusColors[countdown.status])}>{countdown.status.replace("_", " ")}</span>],
                      ["Start Time", new Date(countdown.startTime).toLocaleString()],
                      ["Duration", formatDuration(countdown.duration)],
                      countdown.startedAt && ["Started At", new Date(countdown.startedAt).toLocaleString()],
                      countdown.isPaused && countdown.pausedAt && ["Paused At", new Date(countdown.pausedAt).toLocaleString()],
                      countdown.isPaused && ["Pause Reason", <span key="pr" className="text-amber-600">{countdown.pauseReason}</span>],
                      countdown.scheduledPauseAt && ["Scheduled Pause", <span key="sp" className="text-amber-600">{new Date(countdown.scheduledPauseAt).toLocaleTimeString()}</span>],
                      ["Total Paused", formatDuration(countdown.totalPausedDuration)],
                    ].filter(Boolean).map((row, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-black/5 last:border-0">
                        <span className="text-black/50">{(row as [string, React.ReactNode])[0]}</span>
                        <span className="font-medium text-right">{(row as [string, React.ReactNode])[1]}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

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
                    <Toggle label="Show Logo" checked={display.showLogo} onChange={(v) => handleFieldChange(setDisplay, { ...display, showLogo: v })} />
                    <Toggle label="Show Event Name" checked={display.showEventName} onChange={(v) => handleFieldChange(setDisplay, { ...display, showEventName: v })} />
                    <Toggle label="Show Status Badge" checked={display.showStatus} onChange={(v) => handleFieldChange(setDisplay, { ...display, showStatus: v })} />
                    <Toggle label="Show Timer" checked={display.showTimer} onChange={(v) => handleFieldChange(setDisplay, { ...display, showTimer: v })} />
                    <Toggle label="Show Progress Bar" checked={display.showProgressBar} onChange={(v) => handleFieldChange(setDisplay, { ...display, showProgressBar: v })} />
                    <Toggle label="Show Message" checked={display.showMessage} onChange={(v) => handleFieldChange(setDisplay, { ...display, showMessage: v })} />
                    <Toggle label="Show Started At" checked={display.showStartedAt} onChange={(v) => handleFieldChange(setDisplay, { ...display, showStartedAt: v })} />
                    <Toggle label="Show End Time" checked={display.showEndTime} onChange={(v) => handleFieldChange(setDisplay, { ...display, showEndTime: v })} />
                    <Toggle label="Show Elapsed Time" checked={display.showElapsed} onChange={(v) => handleFieldChange(setDisplay, { ...display, showElapsed: v })} />
                    <Toggle label="Show Footer" checked={display.showFooter} onChange={(v) => handleFieldChange(setDisplay, { ...display, showFooter: v })} />
                  </div>
                </Card>

                <Card title="Completed State" icon={<CheckCircle className="w-4 h-4" />}>
                  <div className="space-y-4">
                    <BashawayInput
                      label="Completed Title"
                      value={display.completedTitle}
                      onChange={(v) => handleFieldChange(setDisplay, { ...display, completedTitle: v })}
                      placeholder="Event Complete!"
                    />
                    <BashawayInput
                      label="Completed Subtitle"
                      value={display.completedSubtitle}
                      onChange={(v) => handleFieldChange(setDisplay, { ...display, completedSubtitle: v })}
                      placeholder="Thank you for participating"
                    />
                  </div>
                </Card>

                <Card title="Progress Bar" icon={<Layout className="w-4 h-4" />} className="lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <BashawayInput
                      label="Height (px)"
                      type="number"
                      value={progressBar.height?.toString() || "6"}
                      onChange={(v) => handleFieldChange(setProgressBar, { ...progressBar, height: parseInt(v) || 6 })}
                    />
                    <BashawayInput
                      label="Border Radius (px)"
                      type="number"
                      value={progressBar.borderRadius?.toString() || "3"}
                      onChange={(v) => handleFieldChange(setProgressBar, { ...progressBar, borderRadius: parseInt(v) || 3 })}
                    />
                    <div>
                      <label className="block text-sm text-black/60 mb-1.5">Fill Color</label>
                      <div className="flex items-center gap-2 h-12">
                        <input
                          type="color"
                          value={progressBar.fillColor || "#EF4444"}
                          onChange={(e) => handleFieldChange(setProgressBar, { ...progressBar, fillColor: e.target.value })}
                          className="w-12 h-10 rounded cursor-pointer border border-black/10"
                        />
                        <input
                          type="text"
                          value={progressBar.fillColor || "#EF4444"}
                          onChange={(e) => handleFieldChange(setProgressBar, { ...progressBar, fillColor: e.target.value })}
                          className="flex-1 h-full px-3 bg-white border border-black/20 rounded-md text-sm font-mono focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Toggle
                        label="Show Labels"
                        checked={progressBar.showLabels ?? true}
                        onChange={(v) => handleFieldChange(setProgressBar, { ...progressBar, showLabels: v })}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

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
                    <ColorInput label="Primary" value={theme.primaryColor} onChange={(v) => handleFieldChange(setTheme, { ...theme, primaryColor: v })} />
                    <ColorInput label="Background" value={theme.backgroundColor} onChange={(v) => handleFieldChange(setTheme, { ...theme, backgroundColor: v })} />
                    <ColorInput label="Text" value={theme.textColor} onChange={(v) => handleFieldChange(setTheme, { ...theme, textColor: v })} />
                    <ColorInput label="Accent" value={theme.accentColor} onChange={(v) => handleFieldChange(setTheme, { ...theme, accentColor: v })} />
                  </div>
                </Card>

                <Card title="Preview" icon={<Eye className="w-4 h-4" />}>
                  <div
                    className="rounded-xl p-6 flex flex-col items-center"
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

              <Card title="Status Badge Styles" icon={<Layout className="w-4 h-4" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(["not_started", "running", "paused", "ended"] as const).map((status) => (
                    <div key={status} className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="text-sm font-semibold capitalize mb-3 flex items-center gap-2">
                        <span className={twMerge("w-2 h-2 rounded-full", statusColors[status])} />
                        {status.replace("_", " ")}
                      </h4>
                      <div className="space-y-3">
                        <ColorInput
                          label="Badge BG"
                          value={statusStyles[status]?.badgeColor || DEFAULT_STATUS_STYLES[status].badgeColor}
                          onChange={(v) => updateStatusStyle(status, "badgeColor", v)}
                        />
                        <ColorInput
                          label="Badge Text"
                          value={statusStyles[status]?.badgeTextColor || DEFAULT_STATUS_STYLES[status].badgeTextColor}
                          onChange={(v) => updateStatusStyle(status, "badgeTextColor", v)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

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
                  <BashawayInput
                    label="Event Name Font"
                    value={fonts.eventName}
                    onChange={(v) => handleFieldChange(setFonts, { ...fonts, eventName: v })}
                    placeholder="system-ui, sans-serif"
                  />
                  <BashawayInput
                    label="Timer Font"
                    value={fonts.timer}
                    onChange={(v) => handleFieldChange(setFonts, { ...fonts, timer: v })}
                    placeholder="'SF Mono', monospace"
                  />
                  <BashawayInput
                    label="Labels Font"
                    value={fonts.labels}
                    onChange={(v) => handleFieldChange(setFonts, { ...fonts, labels: v })}
                    placeholder="system-ui, sans-serif"
                  />
                  <BashawayInput
                    label="Message Font"
                    value={fonts.message}
                    onChange={(v) => handleFieldChange(setFonts, { ...fonts, message: v })}
                    placeholder="system-ui, sans-serif"
                  />
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-black/50 mb-3">Preview</p>
                  <p className="text-2xl font-bold mb-2" style={{ fontFamily: fonts.eventName }}>Event Name</p>
                  <p className="text-4xl font-bold mb-2" style={{ fontFamily: fonts.timer }}>12:34:56</p>
                  <p className="text-sm uppercase tracking-wider mb-2 opacity-50" style={{ fontFamily: fonts.labels }}>HOURS MINUTES SECONDS</p>
                  <p className="text-base opacity-70" style={{ fontFamily: fonts.message }}>This is a sample message</p>
                </div>
              </Card>
            </motion.div>
          )}

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
                    <p className="text-black/50 text-sm text-center py-8">No activity yet</p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={log._id || i} className="flex items-center gap-3 py-3 border-b border-black/5 last:border-0">
                        <div className={twMerge(
                          "w-2 h-2 rounded-full",
                          log.action === "start" && "bg-green-500",
                          log.action === "pause" && "bg-amber-500",
                          log.action === "resume" && "bg-blue-500",
                          log.action === "end" && "bg-red-500",
                          log.action === "reset" && "bg-gray-500",
                          log.action === "update" && "bg-purple-500",
                          log.action === "schedule_pause" && "bg-amber-400",
                        )} />
                        <span className="text-sm capitalize font-medium">{log.action.replace("_", " ")}</span>
                        {log.reason && <span className="text-xs text-black/50">({log.reason})</span>}
                        <span className="flex-1" />
                        <span className="text-xs text-black/50 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
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
