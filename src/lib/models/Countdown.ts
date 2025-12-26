import mongoose, { Schema, Document, Model } from "mongoose";
import { CountdownState, DEFAULT_STATUS_STYLES, DEFAULT_DISPLAY_CONFIG, DEFAULT_FONT_CONFIG } from "@/types/countdown";

export interface CountdownDocument extends Omit<CountdownState, "_id">, Document {}

const StatusStyleSchema = new Schema({
  backgroundColor: String,
  textColor: String,
  borderColor: String,
  badgeColor: String,
  badgeTextColor: String,
}, { _id: false });

const ScheduledPauseSchema = new Schema({
  id: { type: String, required: true },
  reason: { type: String, required: true },
  startTime: { type: Date, default: null },
  startOffset: { type: Number, default: null },
  duration: { type: Number, required: true },
  executed: { type: Boolean, default: false },
}, { _id: false });

const CountdownSchema = new Schema<CountdownDocument>(
  {
    eventName: { type: String, required: true, default: "Bashaway 2025" },
    startTime: { type: Date, required: true },
    duration: { type: Number, required: true, default: 6 * 60 * 60 * 1000 },
    startedAt: { type: Date, default: null },
    isPaused: { type: Boolean, default: false },
    pausedAt: { type: Date, default: null },
    pauseReason: { type: String, default: "" },
    totalPausedDuration: { type: Number, default: 0 },
    scheduledPauses: { type: [ScheduledPauseSchema], default: [] },
    status: {
      type: String,
      enum: ["not_started", "running", "paused", "ended"],
      default: "not_started",
    },
    message: { type: String, default: "" },
    theme: {
      primaryColor: { type: String, default: "#EF4444" },
      backgroundColor: { type: String, default: "#0a0a0a" },
      textColor: { type: String, default: "#FFFFFF" },
      accentColor: { type: String, default: "#F59E0B" },
    },
    statusStyles: {
      not_started: { type: StatusStyleSchema, default: () => DEFAULT_STATUS_STYLES.not_started },
      running: { type: StatusStyleSchema, default: () => DEFAULT_STATUS_STYLES.running },
      paused: { type: StatusStyleSchema, default: () => DEFAULT_STATUS_STYLES.paused },
      ended: { type: StatusStyleSchema, default: () => DEFAULT_STATUS_STYLES.ended },
    },
    display: {
      showLogo: { type: Boolean, default: true },
      showEventName: { type: Boolean, default: true },
      showStatus: { type: Boolean, default: true },
      showTimer: { type: Boolean, default: true },
      showProgressBar: { type: Boolean, default: true },
      showMessage: { type: Boolean, default: false },
      showStartedAt: { type: Boolean, default: true },
      showEndTime: { type: Boolean, default: true },
      showElapsed: { type: Boolean, default: true },
      showFooter: { type: Boolean, default: true },
      completedTitle: { type: String, default: DEFAULT_DISPLAY_CONFIG.completedTitle },
      completedSubtitle: { type: String, default: DEFAULT_DISPLAY_CONFIG.completedSubtitle },
    },
    fonts: {
      eventName: { type: String, default: DEFAULT_FONT_CONFIG.eventName },
      timer: { type: String, default: DEFAULT_FONT_CONFIG.timer },
      labels: { type: String, default: DEFAULT_FONT_CONFIG.labels },
      message: { type: String, default: DEFAULT_FONT_CONFIG.message },
    },
    progressBar: {
      height: { type: Number, default: 6 },
      borderRadius: { type: Number, default: 3 },
      showLabels: { type: Boolean, default: true },
      backgroundColor: { type: String, default: "rgba(255,255,255,0.1)" },
      fillColor: { type: String, default: "#EF4444" },
    },
  },
  { timestamps: true }
);

const CountdownModel: Model<CountdownDocument> =
  mongoose.models.Countdown || mongoose.model<CountdownDocument>("Countdown", CountdownSchema);

export default CountdownModel;
