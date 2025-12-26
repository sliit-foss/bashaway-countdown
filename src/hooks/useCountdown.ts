"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CountdownState, DEFAULT_COUNTDOWN_STATE } from "@/types/countdown";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function useCountdown(pollInterval = 5000) {
  const [countdown, setCountdown] = useState<CountdownState>(DEFAULT_COUNTDOWN_STATE);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCountdown = useCallback(async () => {
    try {
      const response = await fetch("/api/countdown");
      if (!response.ok) throw new Error("Failed to fetch countdown");
      const data = await response.json();
      setCountdown(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateTimeRemaining = useCallback(() => {
    if (!countdown.targetTime || countdown.status === "ended") {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    let targetMs = new Date(countdown.targetTime).getTime();

    // If paused, calculate based on pause time
    if (countdown.isPaused && countdown.pausedAt) {
      const pauseTime = new Date(countdown.pausedAt).getTime();
      const now = Date.now();
      const additionalPause = now - pauseTime;
      targetMs += additionalPause;
    }

    // Add total paused duration
    targetMs += countdown.totalPausedDuration;

    const now = Date.now();
    const total = Math.max(0, targetMs - now);

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds, total };
  }, [countdown]);

  // Initial fetch
  useEffect(() => {
    fetchCountdown();
  }, [fetchCountdown]);

  // Poll for updates
  useEffect(() => {
    const pollId = setInterval(fetchCountdown, pollInterval);
    return () => clearInterval(pollId);
  }, [fetchCountdown, pollInterval]);

  // Update time remaining every second
  useEffect(() => {
    const updateTime = () => {
      setTimeRemaining(calculateTimeRemaining());
    };

    updateTime();
    intervalRef.current = setInterval(updateTime, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [calculateTimeRemaining]);

  return {
    countdown,
    timeRemaining,
    loading,
    error,
    refetch: fetchCountdown,
  };
}

export function useCountdownAdmin() {
  const [countdown, setCountdown] = useState<CountdownState>(DEFAULT_COUNTDOWN_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountdown = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/countdown");
      if (!response.ok) throw new Error("Failed to fetch countdown");
      const data = await response.json();
      setCountdown(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const performAction = useCallback(
    async (action: string, data?: Record<string, unknown>) => {
      try {
        setSaving(true);
        const response = await fetch("/api/countdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...data }),
        });
        if (!response.ok) throw new Error("Failed to perform action");
        const result = await response.json();
        setCountdown(result);
        setError(null);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const updateSettings = useCallback(
    async (settings: Partial<CountdownState>) => {
      try {
        setSaving(true);
        const response = await fetch("/api/countdown", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error("Failed to update settings");
        const result = await response.json();
        setCountdown(result);
        setError(null);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCountdown();
  }, [fetchCountdown]);

  return {
    countdown,
    loading,
    saving,
    error,
    refetch: fetchCountdown,
    start: () => performAction("start"),
    pause: (reason?: string) => performAction("pause", { reason }),
    resume: () => performAction("resume"),
    reset: () => performAction("reset"),
    end: () => performAction("end"),
    updateSettings,
  };
}

