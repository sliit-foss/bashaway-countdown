"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Save,
  RefreshCw,
  Settings,
  Palette,
  MessageSquare,
  Clock,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { useCountdownAdmin } from "@/hooks/useCountdown";
import { CountdownLog } from "@/types/countdown";

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

function Button({
  onClick,
  disabled,
  variant = "primary",
  children,
  className,
  loading,
}: ButtonProps) {
  const variants = {
    primary: "bg-red-500 hover:bg-red-600 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-black",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={twMerge(
        "px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {loading ? (
        <RefreshCw className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  className,
}: InputProps) {
  return (
    <div className={twMerge("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium text-gray-300 min-w-[120px]">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-700"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm w-28 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
    </div>
  );
}

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function Card({ title, icon, children, className }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        "bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

interface AdminControlsProps {
  onLogout?: () => void;
}

export default function AdminControls({ onLogout }: AdminControlsProps) {
  const {
    countdown,
    loading,
    saving,
    error,
    refetch,
    start,
    pause,
    resume,
    reset,
    end,
    updateSettings,
  } = useCountdownAdmin();

  const [eventName, setEventName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(true);
  const [pauseReason, setPauseReason] = useState("");
  const [theme, setTheme] = useState({
    primaryColor: "#EF4444",
    backgroundColor: "#0F0F0F",
    textColor: "#FFFFFF",
    accentColor: "#F97316",
  });
  const [logs, setLogs] = useState<CountdownLog[]>([]);
  const [activeTab, setActiveTab] = useState<"controls" | "settings" | "theme" | "logs">("controls");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Sync form state with countdown data
  useEffect(() => {
    if (countdown) {
      setEventName(countdown.eventName);
      setMessage(countdown.message);
      setShowMessage(countdown.showMessage);
      setTheme(countdown.theme);

      if (countdown.targetTime) {
        const date = new Date(countdown.targetTime);
        setTargetDate(date.toISOString().split("T")[0]);
        setTargetTime(date.toTimeString().slice(0, 5));
      }
    }
  }, [countdown]);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch("/api/countdown/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = async (action: () => Promise<unknown>, successMsg: string) => {
    try {
      await action();
      showNotification("success", successMsg);
      fetchLogs();
    } catch {
      showNotification("error", "Action failed. Please try again.");
    }
  };

  const handleSaveSettings = async () => {
    const targetDateTime = new Date(`${targetDate}T${targetTime}`);
    await handleAction(
      () =>
        updateSettings({
          eventName,
          targetTime: targetDateTime,
          message,
          showMessage,
          theme,
        }),
      "Settings saved successfully!"
    );
  };

  const handlePause = async () => {
    await handleAction(
      () => pause(pauseReason || "Paused"),
      "Countdown paused"
    );
    setPauseReason("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-red-500" />
        </motion.div>
      </div>
    );
  }

  const statusColors = {
    not_started: "bg-gray-500",
    running: "bg-emerald-500",
    paused: "bg-amber-500",
    ended: "bg-rose-500",
  };

  const tabs = [
    { id: "controls", label: "Controls", icon: <Play className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
    { id: "theme", label: "Theme", icon: <Palette className="w-4 h-4" /> },
    { id: "logs", label: "Activity Log", icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={twMerge(
              "fixed top-4 right-4 z-50 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl",
              notification.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
            )}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Bashaway Admin</h1>
              <div
                className={twMerge(
                  "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                  statusColors[countdown.status]
                )}
              >
                {countdown.status.replace("_", " ")}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={refetch}
                disabled={saving}
                className="!py-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Display
              </a>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={twMerge(
                  "px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all",
                  activeTab === tab.id
                    ? "bg-red-500/10 text-red-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "controls" && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Quick Actions */}
              <Card title="Quick Actions" icon={<Play className="w-5 h-5" />}>
                <div className="grid grid-cols-2 gap-4">
                  {countdown.status === "not_started" && (
                    <Button
                      variant="success"
                      onClick={() => handleAction(start, "Countdown started!")}
                      disabled={saving}
                      loading={saving}
                      className="col-span-2"
                    >
                      <Play className="w-5 h-5" />
                      Start Countdown
                    </Button>
                  )}

                  {countdown.status === "running" && (
                    <Button
                      variant="warning"
                      onClick={handlePause}
                      disabled={saving}
                      loading={saving}
                      className="col-span-2"
                    >
                      <Pause className="w-5 h-5" />
                      Pause Countdown
                    </Button>
                  )}

                  {countdown.status === "paused" && (
                    <Button
                      variant="success"
                      onClick={() => handleAction(resume, "Countdown resumed!")}
                      disabled={saving}
                      loading={saving}
                      className="col-span-2"
                    >
                      <Play className="w-5 h-5" />
                      Resume Countdown
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    onClick={() => handleAction(reset, "Countdown reset!")}
                    disabled={saving || countdown.status === "not_started"}
                    loading={saving}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => handleAction(end, "Countdown ended!")}
                    disabled={saving || countdown.status === "ended"}
                    loading={saving}
                  >
                    <Square className="w-5 h-5" />
                    End Event
                  </Button>
                </div>

                {/* Pause Reason Input */}
                {countdown.status === "running" && (
                  <div className="mt-6">
                    <Input
                      label="Pause Reason (optional)"
                      value={pauseReason}
                      onChange={setPauseReason}
                      placeholder="e.g., Lunch Break, Technical Issue"
                    />
                  </div>
                )}
              </Card>

              {/* Current Status */}
              <Card title="Current Status" icon={<Clock className="w-5 h-5" />}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <span className="text-gray-400">Event Name</span>
                    <span className="font-medium">{countdown.eventName}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <span className="text-gray-400">Target Time</span>
                    <span className="font-medium font-mono">
                      {new Date(countdown.targetTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <span className="text-gray-400">Status</span>
                    <span
                      className={twMerge(
                        "px-3 py-1 rounded-full text-xs font-semibold uppercase",
                        statusColors[countdown.status]
                      )}
                    >
                      {countdown.status.replace("_", " ")}
                    </span>
                  </div>
                  {countdown.startedAt && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-800">
                      <span className="text-gray-400">Started At</span>
                      <span className="font-medium font-mono">
                        {new Date(countdown.startedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {countdown.isPaused && countdown.pausedAt && (
                    <>
                      <div className="flex justify-between items-center py-3 border-b border-gray-800">
                        <span className="text-gray-400">Paused At</span>
                        <span className="font-medium font-mono">
                          {new Date(countdown.pausedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-800">
                        <span className="text-gray-400">Pause Reason</span>
                        <span className="font-medium text-amber-400">
                          {countdown.pauseReason}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-400">Total Paused Duration</span>
                    <span className="font-medium font-mono">
                      {Math.floor(countdown.totalPausedDuration / 1000 / 60)} min
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Event Settings */}
              <Card title="Event Settings" icon={<Settings className="w-5 h-5" />}>
                <div className="space-y-6">
                  <Input
                    label="Event Name"
                    value={eventName}
                    onChange={setEventName}
                    placeholder="Bashaway 2025"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Target Date"
                      type="date"
                      value={targetDate}
                      onChange={setTargetDate}
                    />
                    <Input
                      label="Target Time"
                      type="time"
                      value={targetTime}
                      onChange={setTargetTime}
                    />
                  </div>
                </div>
              </Card>

              {/* Message Settings */}
              <Card title="Display Message" icon={<MessageSquare className="w-5 h-5" />}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Show Message</span>
                    <button
                      onClick={() => setShowMessage(!showMessage)}
                      className={twMerge(
                        "p-2 rounded-lg transition-colors",
                        showMessage
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-gray-800 text-gray-400"
                      )}
                    >
                      {showMessage ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-300">
                      Message Text
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter a message to display..."
                      rows={3}
                      className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Save Button */}
              <div className="lg:col-span-2">
                <Button
                  variant="primary"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  loading={saving}
                  className="w-full !py-4 text-lg"
                >
                  <Save className="w-5 h-5" />
                  Save All Settings
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === "theme" && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Theme Colors */}
              <Card title="Theme Colors" icon={<Palette className="w-5 h-5" />}>
                <div className="space-y-6">
                  <ColorPicker
                    label="Primary Color"
                    value={theme.primaryColor}
                    onChange={(v) => setTheme({ ...theme, primaryColor: v })}
                  />
                  <ColorPicker
                    label="Background"
                    value={theme.backgroundColor}
                    onChange={(v) => setTheme({ ...theme, backgroundColor: v })}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={theme.textColor}
                    onChange={(v) => setTheme({ ...theme, textColor: v })}
                  />
                  <ColorPicker
                    label="Accent Color"
                    value={theme.accentColor}
                    onChange={(v) => setTheme({ ...theme, accentColor: v })}
                  />
                </div>
              </Card>

              {/* Theme Preview */}
              <Card title="Preview" icon={<Eye className="w-5 h-5" />}>
                <div
                  className="rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]"
                  style={{ backgroundColor: theme.backgroundColor }}
                >
                  <h3
                    className="text-2xl font-bold mb-4"
                    style={{ color: theme.textColor }}
                  >
                    {eventName || "Event Name"}
                  </h3>
                  <div
                    className="px-4 py-2 rounded-full text-sm font-semibold mb-6"
                    style={{
                      backgroundColor: `${theme.primaryColor}30`,
                      color: theme.primaryColor,
                    }}
                  >
                    RUNNING
                  </div>
                  <div className="flex gap-4">
                    {["12", "34", "56"].map((num, i) => (
                      <div
                        key={i}
                        className="px-6 py-4 rounded-xl text-3xl font-mono font-bold"
                        style={{
                          backgroundColor: `${theme.primaryColor}15`,
                          color: theme.textColor,
                          border: `2px solid ${theme.primaryColor}30`,
                        }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  {showMessage && message && (
                    <p
                      className="mt-6 text-sm opacity-70"
                      style={{ color: theme.textColor }}
                    >
                      {message}
                    </p>
                  )}
                </div>
              </Card>

              {/* Save Theme Button */}
              <div className="lg:col-span-2">
                <Button
                  variant="primary"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  loading={saving}
                  className="w-full !py-4 text-lg"
                >
                  <Save className="w-5 h-5" />
                  Save Theme
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card title="Activity Log" icon={<History className="w-5 h-5" />}>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No activity logged yet
                    </p>
                  ) : (
                    logs.map((log, index) => (
                      <motion.div
                        key={log._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl"
                      >
                        <div
                          className={twMerge(
                            "p-2 rounded-lg",
                            log.action === "start" && "bg-emerald-500/20 text-emerald-400",
                            log.action === "pause" && "bg-amber-500/20 text-amber-400",
                            log.action === "resume" && "bg-blue-500/20 text-blue-400",
                            log.action === "reset" && "bg-gray-500/20 text-gray-400",
                            log.action === "end" && "bg-rose-500/20 text-rose-400",
                            log.action === "update" && "bg-purple-500/20 text-purple-400"
                          )}
                        >
                          {log.action === "start" && <Play className="w-4 h-4" />}
                          {log.action === "pause" && <Pause className="w-4 h-4" />}
                          {log.action === "resume" && <Play className="w-4 h-4" />}
                          {log.action === "reset" && <RotateCcw className="w-4 h-4" />}
                          {log.action === "end" && <Square className="w-4 h-4" />}
                          {log.action === "update" && <Settings className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-semibold capitalize">
                              {log.action}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {log.reason && (
                            <p className="text-sm text-gray-400 mt-1">
                              Reason: {log.reason}
                            </p>
                          )}
                        </div>
                      </motion.div>
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

