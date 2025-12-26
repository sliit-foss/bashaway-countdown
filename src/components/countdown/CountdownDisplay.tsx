"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pause } from "lucide-react";
import Image from "next/image";
import { useCountdown } from "@/hooks/useCountdown";
import { formatDuration, DEFAULT_STATUS_STYLES, DEFAULT_DISPLAY_CONFIG, DEFAULT_FONT_CONFIG } from "@/types/countdown";

function TimeUnit({ value, label, font, textColor }: { value: number; label: string; font: string; textColor: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-[80px] sm:text-[100px] md:text-[140px] lg:text-[180px] font-black tabular-nums"
        style={{ fontFamily: font, color: textColor, lineHeight: 1 }}
      >
        {value.toString().padStart(2, "0")}
      </span>
      <span 
        className="mt-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] opacity-40"
        style={{ color: textColor }}
      >
        {label}
      </span>
    </div>
  );
}

function ColonSeparator({ color, font }: { color: string; font: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        className="text-[80px] sm:text-[100px] md:text-[140px] lg:text-[180px] font-black mx-1 sm:mx-2 md:mx-4"
        style={{ fontFamily: font, color: color, lineHeight: 1 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        :
      </motion.span>
      <span className="mt-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] opacity-0">
        &nbsp;
      </span>
    </div>
  );
}

export default function CountdownDisplay() {
  const { countdown, timeRemaining, loading } = useCountdown(3000);
  
  const theme = countdown.theme || { primaryColor: "#EF4444", backgroundColor: "#0a0a0a", textColor: "#FFFFFF", accentColor: "#F59E0B" };
  const statusStyles = countdown.statusStyles || DEFAULT_STATUS_STYLES;
  const display = countdown.display || DEFAULT_DISPLAY_CONFIG;
  const fonts = countdown.fonts || DEFAULT_FONT_CONFIG;
  const progressBar = countdown.progressBar || { height: 6, borderRadius: 3, showLabels: true, backgroundColor: "rgba(255,255,255,0.1)", fillColor: "#EF4444" };
  const pausePrefix = countdown.pausePrefix || "Paused for";
  
  const currentStatusStyle = statusStyles[countdown.status] || DEFAULT_STATUS_STYLES[countdown.status];
  const isDarkBg = theme.backgroundColor?.toLowerCase().includes("0a") || 
                   theme.backgroundColor?.toLowerCase().includes("00") ||
                   theme.backgroundColor === "#000000";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.backgroundColor }}>
        <motion.div
          className="w-10 h-10 border-3 rounded-full"
          style={{ borderColor: `${theme.primaryColor}30`, borderTopColor: theme.primaryColor }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const isCountingToStart = countdown.status === "not_started";
  const isEnded = countdown.status === "ended";
  const isPaused = countdown.isPaused;

  const getPauseStatusText = () => {
    if (!isPaused || !countdown.pauseReason) return "Paused";
    if (pausePrefix) return `${pausePrefix} ${countdown.pauseReason}`;
    return countdown.pauseReason;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${theme.primaryColor}12 0%, transparent 50%),
                       radial-gradient(ellipse 60% 40% at 50% 110%, ${theme.accentColor}08 0%, transparent 40%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl">
        <AnimatePresence>
          {display.showLogo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 sm:mb-8"
            >
              <Image
                src={isDarkBg ? "/logo-light.png" : "/logo-dark.png"}
                alt="SLIIT FOSS"
                width={80}
                height={80}
                className="opacity-80 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {display.showEventName && (
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-center mb-4 sm:mb-6"
              style={{ fontFamily: fonts.eventName }}
            >
              {countdown.eventName}
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {display.showStatus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-8 sm:mb-12 md:mb-16"
            >
              <div
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2"
                style={{
                  backgroundColor: currentStatusStyle.badgeColor,
                  color: currentStatusStyle.badgeTextColor,
                  border: `1px solid ${currentStatusStyle.borderColor}`,
                }}
              >
                {isPaused && <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                {isCountingToStart ? "Starting Soon" : isPaused ? getPauseStatusText() : isEnded ? "Ended" : "Live"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {display.showTimer && !isEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start justify-center"
            >
              {timeRemaining.days > 0 && (
                <>
                  <TimeUnit value={timeRemaining.days} label="Days" font={fonts.timer} textColor={theme.textColor} />
                  <ColonSeparator color={theme.primaryColor} font={fonts.timer} />
                </>
              )}
              <TimeUnit value={timeRemaining.hours} label="Hours" font={fonts.timer} textColor={theme.textColor} />
              <ColonSeparator color={theme.primaryColor} font={fonts.timer} />
              <TimeUnit value={timeRemaining.minutes} label="Minutes" font={fonts.timer} textColor={theme.textColor} />
              <ColonSeparator color={theme.primaryColor} font={fonts.timer} />
              <TimeUnit value={timeRemaining.seconds} label="Seconds" font={fonts.timer} textColor={theme.textColor} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4"
                style={{ color: theme.primaryColor, fontFamily: fonts.eventName }}
              >
                {display.completedTitle}
              </div>
              {display.completedSubtitle && (
                <p className="text-lg sm:text-xl opacity-60" style={{ fontFamily: fonts.message }}>
                  {display.completedSubtitle}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {display.showProgressBar && countdown.status === "running" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md sm:max-w-lg mt-10 sm:mt-14"
            >
              <div
                className="overflow-hidden"
                style={{
                  height: progressBar.height,
                  borderRadius: progressBar.borderRadius,
                  backgroundColor: progressBar.backgroundColor,
                }}
              >
                <motion.div
                  className="h-full"
                  style={{
                    backgroundColor: progressBar.fillColor,
                    borderRadius: progressBar.borderRadius,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${timeRemaining.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {progressBar.showLabels && (
                <div className="flex justify-between mt-2 sm:mt-3 text-[10px] sm:text-xs opacity-40" style={{ fontFamily: fonts.labels }}>
                  {display.showElapsed && <span>{formatDuration(timeRemaining.elapsed)} elapsed</span>}
                  <span>{formatDuration(countdown.duration)} total</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {display.showMessage && countdown.message && !countdown.message.startsWith("Scheduled:") && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="mt-8 sm:mt-12 text-base sm:text-lg md:text-xl text-center max-w-xl"
              style={{ fontFamily: fonts.message }}
            >
              {countdown.message}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm"
          style={{ fontFamily: fonts.labels }}
        >
          {display.showStartedAt && countdown.startedAt && (
            <span>Started: {new Date(countdown.startedAt).toLocaleString()}</span>
          )}
        </motion.div>

        <AnimatePresence>
          {display.showFooter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-4 sm:bottom-6 text-xs sm:text-sm font-semibold tracking-wider"
            >
              SLIIT FOSS
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
