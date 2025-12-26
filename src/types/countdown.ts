export interface CountdownState {
  _id?: string;
  eventName: string;
  targetTime: Date;
  startedAt: Date | null;
  isPaused: boolean;
  pausedAt: Date | null;
  pauseReason: string;
  totalPausedDuration: number; // in milliseconds
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
  action: "start" | "pause" | "resume" | "reset" | "update" | "end";
  timestamp: Date;
  reason?: string;
  performedBy?: string;
  previousState?: Partial<CountdownState>;
  newState?: Partial<CountdownState>;
}

export const DEFAULT_COUNTDOWN_STATE: CountdownState = {
  eventName: "Bashaway 2025",
  targetTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  startedAt: null,
  isPaused: false,
  pausedAt: null,
  pauseReason: "",
  totalPausedDuration: 0,
  status: "not_started",
  message: "Get ready for Bashaway!",
  theme: {
    primaryColor: "#EF4444", // Bashaway red
    backgroundColor: "#0F0F0F",
    textColor: "#FFFFFF",
    accentColor: "#F97316",
  },
  showMessage: true,
};

