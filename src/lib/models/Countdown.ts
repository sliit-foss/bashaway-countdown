import mongoose, { Schema, Document, Model } from "mongoose";
import { CountdownState } from "@/types/countdown";

export interface CountdownDocument extends Omit<CountdownState, "_id">, Document {}

const CountdownSchema = new Schema<CountdownDocument>(
  {
    eventName: { type: String, required: true, default: "Bashaway 2025" },
    targetTime: { type: Date, required: true },
    startedAt: { type: Date, default: null },
    isPaused: { type: Boolean, default: false },
    pausedAt: { type: Date, default: null },
    pauseReason: { type: String, default: "" },
    totalPausedDuration: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["not_started", "running", "paused", "ended"],
      default: "not_started",
    },
    message: { type: String, default: "Get ready for Bashaway!" },
    theme: {
      primaryColor: { type: String, default: "#EF4444" },
      backgroundColor: { type: String, default: "#0F0F0F" },
      textColor: { type: String, default: "#FFFFFF" },
      accentColor: { type: String, default: "#F97316" },
    },
    showMessage: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const CountdownModel: Model<CountdownDocument> =
  mongoose.models.Countdown || mongoose.model<CountdownDocument>("Countdown", CountdownSchema);

export default CountdownModel;

