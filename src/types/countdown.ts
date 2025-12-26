export interface ScheduledPause {
  id: string;
  reason: string;
  startTime: Date | null;
  startOffset: number | null; // milliseconds from event start
  duration: number; // milliseconds
  executed: boolean;
}

export interface CountdownState {
  _id?: string;
  eventName: string;
  startTime: Date;
  duration: number; // event duration in milliseconds
  startedAt: Date | null;
  isPaused: boolean;
  pausedAt: Date | null;
  pauseReason: string;
  totalPausedDuration: number;
  scheduledPauses: ScheduledPause[];
  status: "not_started" | "running" | "paused" | "ended";
  message: string;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  showMessage: boolean;
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

export const DEFAULT_COUNTDOWN_STATE: CountdownState = {
  eventName: "Bashaway 2025",
  startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
  duration: 6 * 60 * 60 * 1000, // 6 hours default
  startedAt: null,
  isPaused: false,
  pausedAt: null,
  pauseReason: "",
  totalPausedDuration: 0,
  scheduledPauses: [],
  status: "not_started",
  message: "",
  theme: {
    primaryColor: "#EF4444",
    backgroundColor: "#0a0a0a",
    textColor: "#FFFFFF",
    accentColor: "#F97316",
  },
  showMessage: false,
};

export function parseDuration(input: string): number | null {
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
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
