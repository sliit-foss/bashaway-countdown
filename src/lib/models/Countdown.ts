import mongoose, { Schema, Document, Model } from "mongoose";
import { CountdownState } from "@/types/countdown";

export interface CountdownDocument extends Omit<CountdownState, "_id">, Document {}

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
      accentColor: { type: String, default: "#F97316" },
    },
    showMessage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CountdownModel: Model<CountdownDocument> =
  mongoose.models.Countdown || mongoose.model<CountdownDocument>("Countdown", CountdownSchema);

export default CountdownModel;
