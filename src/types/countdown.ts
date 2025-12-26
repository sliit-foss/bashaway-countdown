export interface StatusStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  badgeColor: string;
  badgeTextColor: string;
}

export interface DisplayConfig {
  showLogo: boolean;
  showEventName: boolean;
  showStatus: boolean;
  showTimer: boolean;
  showProgressBar: boolean;
  showMessage: boolean;
  showStartedAt: boolean;
  showEndTime: boolean;
  showElapsed: boolean;
  showFooter: boolean;
  completedTitle: string;
  completedSubtitle: string;
}

export interface FontConfig {
  eventName: string;
  timer: string;
  labels: string;
  message: string;
}

export interface ScheduledPause {
  id: string;
  reason: string;
  startTime: Date | null;
  startOffset: number | null;
  duration: number;
  executed: boolean;
}

export interface CountdownState {
  _id?: string;
  eventName: string;
  startTime: Date;
  duration: number;
  startedAt: Date | null;
  isPaused: boolean;
  pausedAt: Date | null;
  pauseReason: string;
  pausePrefix: string; // e.g., "Paused for", "Paused due to", etc.
  scheduledPauseAt: Date | null; // Future time to pause
  totalPausedDuration: number;
  scheduledPauses: ScheduledPause[];
  status: "not_started" | "running" | "paused" | "ended";
  message: string;
  
  // Theme
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  
  // Status-specific styles
  statusStyles: {
    not_started: StatusStyle;
    running: StatusStyle;
    paused: StatusStyle;
    ended: StatusStyle;
  };
  
  // Display toggles
  display: DisplayConfig;
  
  // Font settings
  fonts: FontConfig;
  
  // Progress bar style
  progressBar: {
    height: number;
    borderRadius: number;
    showLabels: boolean;
    backgroundColor: string;
    fillColor: string;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CountdownLog {
  _id?: string;
  action: "start" | "pause" | "resume" | "reset" | "update" | "end" | "schedule_pause";
  timestamp: Date;
  reason?: string;
  previousState?: Partial<CountdownState>;
  newState?: Partial<CountdownState>;
}

export const DEFAULT_STATUS_STYLES: CountdownState["statusStyles"] = {
  not_started: {
    backgroundColor: "rgba(255,255,255,0.05)",
    textColor: "#9CA3AF",
    borderColor: "rgba(255,255,255,0.1)",
    badgeColor: "rgba(156,163,175,0.2)",
    badgeTextColor: "#9CA3AF",
  },
  running: {
    backgroundColor: "rgba(34,197,94,0.1)",
    textColor: "#22C55E",
    borderColor: "rgba(34,197,94,0.3)",
    badgeColor: "rgba(34,197,94,0.2)",
    badgeTextColor: "#22C55E",
  },
  paused: {
    backgroundColor: "rgba(245,158,11,0.1)",
    textColor: "#F59E0B",
    borderColor: "rgba(245,158,11,0.3)",
    badgeColor: "rgba(245,158,11,0.2)",
    badgeTextColor: "#F59E0B",
  },
  ended: {
    backgroundColor: "rgba(239,68,68,0.1)",
    textColor: "#EF4444",
    borderColor: "rgba(239,68,68,0.3)",
    badgeColor: "rgba(239,68,68,0.2)",
    badgeTextColor: "#EF4444",
  },
};

export const DEFAULT_DISPLAY_CONFIG: DisplayConfig = {
  showLogo: true,
  showEventName: true,
  showStatus: true,
  showTimer: true,
  showProgressBar: true,
  showMessage: false,
  showStartedAt: true,
  showEndTime: true,
  showElapsed: true,
  showFooter: true,
  completedTitle: "Event Complete!",
  completedSubtitle: "Thank you for participating",
};

export const DEFAULT_FONT_CONFIG: FontConfig = {
  eventName: "system-ui, -apple-system, sans-serif",
  timer: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  labels: "system-ui, -apple-system, sans-serif",
  message: "system-ui, -apple-system, sans-serif",
};

export const DEFAULT_COUNTDOWN_STATE: CountdownState = {
  eventName: "Bashaway 2025",
  startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
  duration: 6 * 60 * 60 * 1000,
  startedAt: null,
  isPaused: false,
  pausedAt: null,
  pauseReason: "",
  pausePrefix: "Paused for",
  scheduledPauseAt: null,
  totalPausedDuration: 0,
  scheduledPauses: [],
  status: "not_started",
  message: "",
  theme: {
    primaryColor: "#EF4444",
    backgroundColor: "#0a0a0a",
    textColor: "#FFFFFF",
    accentColor: "#F59E0B",
  },
  statusStyles: DEFAULT_STATUS_STYLES,
  display: DEFAULT_DISPLAY_CONFIG,
  fonts: DEFAULT_FONT_CONFIG,
  progressBar: {
    height: 6,
    borderRadius: 3,
    showLabels: true,
    backgroundColor: "rgba(255,255,255,0.1)",
    fillColor: "#EF4444",
  },
};

export function parseDuration(input: string): number | null {
  if (!input) return null;
  const match = input.match(/^(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?|m|min|mins|minutes?|s|sec|secs|seconds?)?$/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = (match[2] || "h").toLowerCase();
  if (unit.startsWith("h")) return value * 60 * 60 * 1000;
  if (unit.startsWith("m")) return value * 60 * 1000;
  if (unit.startsWith("s")) return value * 1000;
  return value * 60 * 60 * 1000;
}

export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0s";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  if (minutes > 0) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  return `${seconds}s`;
}
