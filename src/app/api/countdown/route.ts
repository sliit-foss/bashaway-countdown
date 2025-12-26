import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CountdownModel, { CountdownDocument } from "@/lib/models/Countdown";
import CountdownLogModel from "@/lib/models/CountdownLog";
import { DEFAULT_COUNTDOWN_STATE } from "@/types/countdown";

async function ensureConnection() {
  try {
    await dbConnect();
    return true;
  } catch (error) {
    console.error("DB connection failed:", error);
    return false;
  }
}

export async function GET() {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return NextResponse.json({ ...DEFAULT_COUNTDOWN_STATE, error: "DB unavailable" }, { status: 503 });
    }

    let countdown = await CountdownModel.findOne().sort({ createdAt: -1 });
    if (!countdown) {
      countdown = new CountdownModel(DEFAULT_COUNTDOWN_STATE);
      await countdown.save();
    }

    return NextResponse.json(countdown);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ ...DEFAULT_COUNTDOWN_STATE, error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    let countdown: CountdownDocument | null = await CountdownModel.findOne().sort({ createdAt: -1 });
    const previousState = countdown?.toObject();

    if (!countdown) {
      countdown = new CountdownModel(DEFAULT_COUNTDOWN_STATE);
    }

    switch (action) {
      case "start":
        countdown.status = "running";
        countdown.startedAt = new Date();
        countdown.isPaused = false;
        countdown.pausedAt = null;
        countdown.pauseReason = "";
        break;

      case "pause":
        if (countdown.status === "running") {
          countdown.status = "paused";
          countdown.isPaused = true;
          countdown.pausedAt = new Date();
          countdown.pauseReason = data.reason || "Paused";
        }
        break;

      case "resume":
        if (countdown.status === "paused" && countdown.pausedAt) {
          const pauseDuration = Date.now() - new Date(countdown.pausedAt).getTime();
          countdown.totalPausedDuration += pauseDuration;
          countdown.status = "running";
          countdown.isPaused = false;
          countdown.pausedAt = null;
          countdown.pauseReason = "";
        }
        break;

      case "reset":
        countdown.status = "not_started";
        countdown.startedAt = null;
        countdown.isPaused = false;
        countdown.pausedAt = null;
        countdown.pauseReason = "";
        countdown.totalPausedDuration = 0;
        if (countdown.scheduledPauses) {
          countdown.scheduledPauses = countdown.scheduledPauses.map(p => ({ ...p, executed: false }));
        }
        break;

      case "end":
        countdown.status = "ended";
        break;

      case "update":
        Object.assign(countdown, data);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await countdown.save();

    try {
      const log = new CountdownLogModel({
        action,
        timestamp: new Date(),
        reason: data.reason,
        previousState,
        newState: countdown.toObject(),
      });
      await log.save();
    } catch { /* ignore */ }

    return NextResponse.json(countdown);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    }

    const body = await request.json();
    let countdown: CountdownDocument | null = await CountdownModel.findOne().sort({ createdAt: -1 });

    if (!countdown) {
      countdown = new CountdownModel({ ...DEFAULT_COUNTDOWN_STATE, ...body });
    } else {
      // Deep merge for nested objects
      if (body.theme) countdown.theme = { ...countdown.theme, ...body.theme };
      if (body.statusStyles) countdown.statusStyles = { ...countdown.statusStyles, ...body.statusStyles };
      if (body.display) countdown.display = { ...countdown.display, ...body.display };
      if (body.fonts) countdown.fonts = { ...countdown.fonts, ...body.fonts };
      if (body.progressBar) countdown.progressBar = { ...countdown.progressBar, ...body.progressBar };
      
      // Simple fields
      if (body.eventName !== undefined) countdown.eventName = body.eventName;
      if (body.startTime !== undefined) countdown.startTime = body.startTime;
      if (body.duration !== undefined) countdown.duration = body.duration;
      if (body.message !== undefined) countdown.message = body.message;
      if (body.scheduledPauses !== undefined) countdown.scheduledPauses = body.scheduledPauses;
    }

    await countdown.save();

    try {
      const log = new CountdownLogModel({
        action: "update",
        timestamp: new Date(),
        newState: countdown.toObject(),
      });
      await log.save();
    } catch { /* ignore */ }

    return NextResponse.json(countdown);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
