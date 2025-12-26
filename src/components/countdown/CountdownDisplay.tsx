"use client";

import { motion } from "framer-motion";
import { Pause } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { formatDuration } from "@/types/countdown";

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <motion.div
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-mono text-6xl sm:text-8xl md:text-9xl font-black tabular-nums"
        >
          {value.toString().padStart(2, "0")}
        </motion.div>
      </div>
      <span className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] opacity-60">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col gap-3 px-2 sm:px-4 md:px-6 pt-2">
      <motion.div
        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-current opacity-40"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.div
        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-current opacity-40"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  );
}

export default function CountdownDisplay() {
  const { countdown, timeRemaining, loading } = useCountdown(3000);
  const { primaryColor, backgroundColor, textColor, accentColor } = countdown.theme;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor }}>
        <motion.div
          className="w-12 h-12 border-4 rounded-full"
          style={{ borderColor: `${primaryColor}30`, borderTopColor: primaryColor }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const isCountingToStart = countdown.status === "not_started";
  const isEnded = countdown.status === "ended";
  const isPaused = countdown.isPaused;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden"
      style={{ backgroundColor, color: textColor }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${primaryColor}15 0%, transparent 50%),
                       radial-gradient(ellipse at 50% 100%, ${accentColor}10 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
        {/* Event Name */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {countdown.eventName}
        </motion.h1>

        {/* Status */}
        <motion.div
          className="mt-4 mb-10 sm:mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
            style={{
              backgroundColor: isPaused ? `${accentColor}20` : isEnded ? `${primaryColor}20` : `${textColor}10`,
              color: isPaused ? accentColor : isEnded ? primaryColor : textColor,
              border: `1px solid ${isPaused ? accentColor : isEnded ? primaryColor : textColor}20`,
            }}
          >
            {isPaused && <Pause className="w-3.5 h-3.5" />}
            {isCountingToStart ? "Starting Soon" : isPaused ? (countdown.pauseReason || "Paused") : isEnded ? "Ended" : "Live"}
          </div>
        </motion.div>

        {/* Timer */}
        {!isEnded ? (
          <motion.div
            className="flex items-start justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {timeRemaining.days > 0 && (
              <>
                <TimeUnit value={timeRemaining.days} label="Days" />
                <Separator />
              </>
            )}
            <TimeUnit value={timeRemaining.hours} label="Hours" />
            <Separator />
            <TimeUnit value={timeRemaining.minutes} label="Minutes" />
            <Separator />
            <TimeUnit value={timeRemaining.seconds} label="Seconds" />
          </motion.div>
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-6xl sm:text-7xl md:text-8xl font-black" style={{ color: primaryColor }}>
              Complete!
            </div>
          </motion.div>
        )}

        {/* Progress bar for running event */}
        {countdown.status === "running" && (
          <motion.div
            className="w-full max-w-md mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${textColor}10` }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: primaryColor }}
                initial={{ width: 0 }}
                animate={{ width: `${timeRemaining.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs opacity-50">
              <span>{formatDuration(timeRemaining.elapsed)}</span>
              <span>{formatDuration(countdown.duration)}</span>
            </div>
          </motion.div>
        )}

        {/* Message */}
        {countdown.showMessage && countdown.message && (
          <motion.p
            className="mt-10 text-lg sm:text-xl text-center max-w-xl opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.6 }}
          >
            {countdown.message}
          </motion.p>
        )}

        {/* Info */}
        {countdown.startedAt && (
          <motion.div
            className="mt-8 text-sm opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
          >
            Started {new Date(countdown.startedAt).toLocaleString()}
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          className="fixed bottom-6 text-sm font-medium tracking-wider opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
        >
          SLIIT FOSS
        </motion.div>
      </div>
    </div>
  );
}
