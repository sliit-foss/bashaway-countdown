"use client";

import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { Pause, Clock, AlertCircle } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";

interface TimeUnitProps {
  value: number;
  label: string;
  primaryColor: string;
  textColor: string;
}

function TimeUnit({ value, label, primaryColor, textColor }: TimeUnitProps) {
  const formattedValue = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative overflow-hidden rounded-2xl backdrop-blur-sm"
        style={{
          background: `linear-gradient(145deg, ${primaryColor}15, ${primaryColor}08)`,
          border: `2px solid ${primaryColor}30`,
          boxShadow: `0 0 40px ${primaryColor}20, inset 0 0 30px ${primaryColor}05`,
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="px-6 py-8 sm:px-10 sm:py-12 md:px-14 md:py-16">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={formattedValue}
              initial={{ y: -40, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="block font-mono text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter"
              style={{ color: textColor }}
            >
              {formattedValue}
            </motion.span>
          </AnimatePresence>
        </div>
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${primaryColor}, transparent 70%)`,
          }}
          animate={{
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
      <span
        className="mt-4 text-sm sm:text-base md:text-lg font-semibold uppercase tracking-[0.3em] opacity-70"
        style={{ color: textColor }}
      >
        {label}
      </span>
    </div>
  );
}

function Separator({ color }: { color: string }) {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export default function CountdownDisplay() {
  const { countdown, timeRemaining, loading, error } = useCountdown(3000);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: countdown.theme.backgroundColor }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Clock
            className="w-16 h-16"
            style={{ color: countdown.theme.primaryColor }}
          />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: countdown.theme.backgroundColor }}
      >
        <div className="text-center">
          <AlertCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: countdown.theme.primaryColor }}
          />
          <p style={{ color: countdown.theme.textColor }}>{error}</p>
        </div>
      </div>
    );
  }

  const { primaryColor, backgroundColor, textColor, accentColor } = countdown.theme;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: primaryColor }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: accentColor }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-7xl">
        {/* Event Name */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-2"
          style={{ color: textColor }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {countdown.eventName}
        </motion.h1>

        {/* Status Badge */}
        <motion.div
          className={twMerge(
            "px-6 py-2 rounded-full mb-8 sm:mb-12 font-semibold text-sm sm:text-base uppercase tracking-wider",
            countdown.isPaused && "animate-pulse"
          )}
          style={{
            backgroundColor: countdown.isPaused
              ? `${accentColor}30`
              : countdown.status === "running"
              ? `${primaryColor}30`
              : `${textColor}20`,
            color: countdown.isPaused
              ? accentColor
              : countdown.status === "running"
              ? primaryColor
              : textColor,
            border: `1px solid ${
              countdown.isPaused
                ? accentColor
                : countdown.status === "running"
                ? primaryColor
                : textColor
            }40`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          {countdown.isPaused && <Pause className="inline w-4 h-4 mr-2" />}
          {countdown.status === "not_started"
            ? "Starting Soon"
            : countdown.status === "paused"
            ? countdown.pauseReason || "Paused"
            : countdown.status === "ended"
            ? "Event Ended"
            : "Live"}
        </motion.div>

        {/* Countdown Timer */}
        {countdown.status !== "ended" ? (
          <motion.div
            className="flex items-center justify-center flex-wrap gap-2 sm:gap-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {timeRemaining.days > 0 && (
              <>
                <TimeUnit
                  value={timeRemaining.days}
                  label="Days"
                  primaryColor={primaryColor}
                  textColor={textColor}
                />
                <Separator color={primaryColor} />
              </>
            )}
            <TimeUnit
              value={timeRemaining.hours}
              label="Hours"
              primaryColor={primaryColor}
              textColor={textColor}
            />
            <Separator color={primaryColor} />
            <TimeUnit
              value={timeRemaining.minutes}
              label="Minutes"
              primaryColor={primaryColor}
              textColor={textColor}
            />
            <Separator color={primaryColor} />
            <TimeUnit
              value={timeRemaining.seconds}
              label="Seconds"
              primaryColor={primaryColor}
              textColor={textColor}
            />
          </motion.div>
        ) : (
          <motion.div
            className="text-4xl sm:text-6xl font-bold"
            style={{ color: primaryColor }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🎉 Event Complete! 🎉
          </motion.div>
        )}

        {/* Message */}
        <AnimatePresence>
          {countdown.showMessage && countdown.message && (
            <motion.p
              className="mt-12 text-lg sm:text-xl md:text-2xl text-center max-w-2xl opacity-80"
              style={{ color: textColor }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 0.8 }}
              exit={{ y: 20, opacity: 0 }}
            >
              {countdown.message}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Started At Info */}
        {countdown.startedAt && (
          <motion.p
            className="mt-8 text-sm opacity-50"
            style={{ color: textColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
          >
            Started at:{" "}
            {new Date(countdown.startedAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </motion.p>
        )}

        {/* Pause Info */}
        {countdown.isPaused && countdown.pausedAt && (
          <motion.div
            className="mt-4 px-6 py-3 rounded-xl"
            style={{
              backgroundColor: `${accentColor}20`,
              border: `1px solid ${accentColor}40`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm" style={{ color: accentColor }}>
              Paused at:{" "}
              {new Date(countdown.pausedAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm font-medium tracking-wider" style={{ color: textColor }}>
            SLIIT FOSS
          </p>
        </motion.div>
      </div>
    </div>
  );
}

