import mongoose, { Schema, Document, Model } from "mongoose";
import { CountdownLog } from "@/types/countdown";

export interface CountdownLogDocument extends Omit<CountdownLog, "_id">, Document {}

const CountdownLogSchema = new Schema<CountdownLogDocument>(
  {
    action: {
      type: String,
      enum: ["start", "pause", "resume", "reset", "update", "end", "schedule_pause"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const CountdownLogModel: Model<CountdownLogDocument> =
  mongoose.models.CountdownLog ||
  mongoose.model<CountdownLogDocument>("CountdownLog", CountdownLogSchema);

export default CountdownLogModel;
