"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CountdownState, DEFAULT_COUNTDOWN_STATE } from "@/types/countdown";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  elapsed: number;
  progress: number;
}

export function useCountdown(pollInterval = 5000) {
  const [countdown, setCountdown] = useState<CountdownState>(DEFAULT_COUNTDOWN_STATE);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, elapsed: 0, progress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCountdown = useCallback(async () => {
    try {
      const response = await fetch("/api/countdown");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setCountdown(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateTimeRemaining = useCallback((): TimeRemaining => {
    const now = Date.now();
    
    if (countdown.status === "not_started") {
      const startMs = new Date(countdown.startTime).getTime();
      const total = Math.max(0, startMs - now);
      return {
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        hours: Math.floor((total / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((total / (1000 * 60)) % 60),
        seconds: Math.floor((total / 1000) % 60),
        total,
        elapsed: 0,
        progress: 0,
      };
    }
    
    if (countdown.status === "ended" || !countdown.startedAt) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, elapsed: countdown.duration, progress: 100 };
    }

    const startedAt = new Date(countdown.startedAt).getTime();
    let elapsed = now - startedAt - countdown.totalPausedDuration;
    
    if (countdown.isPaused && countdown.pausedAt) {
      const pauseStart = new Date(countdown.pausedAt).getTime();
      elapsed = pauseStart - startedAt - countdown.totalPausedDuration;
    }
    
    const total = Math.max(0, countdown.duration - elapsed);
    const progress = Math.min(100, Math.max(0, (elapsed / countdown.duration) * 100));

    return {
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / (1000 * 60)) % 60),
      seconds: Math.floor((total / 1000) % 60),
      total,
      elapsed: Math.max(0, elapsed),
      progress,
    };
  }, [countdown]);

  useEffect(() => { fetchCountdown(); }, [fetchCountdown]);
  useEffect(() => {
    const pollId = setInterval(fetchCountdown, pollInterval);
    return () => clearInterval(pollId);
  }, [fetchCountdown, pollInterval]);

  useEffect(() => {
    const updateTime = () => setTimeRemaining(calculateTimeRemaining());
    updateTime();
    intervalRef.current = setInterval(updateTime, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [calculateTimeRemaining]);

  return { countdown, timeRemaining, loading, error, refetch: fetchCountdown };
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
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setCountdown(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const performAction = useCallback(async (action: string, data?: Record<string, unknown>) => {
    try {
      setSaving(true);
      const response = await fetch("/api/countdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });
      if (!response.ok) throw new Error("Failed");
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
  }, []);

  const updateSettings = useCallback(async (settings: Partial<CountdownState>) => {
    try {
      setSaving(true);
      const response = await fetch("/api/countdown", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed");
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
  }, []);

  useEffect(() => { fetchCountdown(); }, [fetchCountdown]);

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
    performAction,
  };
}
