import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CountdownModel, { CountdownDocument } from "@/lib/models/Countdown";
import CountdownLogModel from "@/lib/models/CountdownLog";
import { DEFAULT_COUNTDOWN_STATE } from "@/types/countdown";

// Helper to ensure DB connection
async function ensureConnection() {
  try {
    await dbConnect();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// GET - Fetch current countdown state
export async function GET() {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return NextResponse.json(
        { error: "Database connection failed", ...DEFAULT_COUNTDOWN_STATE },
        { status: 503 }
      );
    }

    let countdown = await CountdownModel.findOne().sort({ createdAt: -1 });

    if (!countdown) {
      // Create default countdown if none exists
      countdown = new CountdownModel(DEFAULT_COUNTDOWN_STATE);
      await countdown.save();
    }

    return NextResponse.json(countdown);
  } catch (error) {
    console.error("Error fetching countdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch countdown", ...DEFAULT_COUNTDOWN_STATE },
      { status: 500 }
    );
  }
}

// POST - Create or update countdown
export async function POST(request: NextRequest) {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    let countdown: CountdownDocument | null = await CountdownModel.findOne().sort({ createdAt: -1 });
    const previousState = countdown ? countdown.toObject() : null;

    switch (action) {
      case "start":
        if (!countdown) {
          countdown = new CountdownModel({
            ...DEFAULT_COUNTDOWN_STATE,
            status: "running",
            startedAt: new Date(),
          });
          await countdown.save();
        } else {
          countdown.status = "running";
          countdown.startedAt = new Date();
          countdown.isPaused = false;
          countdown.pausedAt = null;
          await countdown.save();
        }
        break;

      case "pause":
        if (countdown && countdown.status === "running") {
          countdown.status = "paused";
          countdown.isPaused = true;
          countdown.pausedAt = new Date();
          countdown.pauseReason = data.reason || "Paused";
          await countdown.save();
        }
        break;

      case "resume":
        if (countdown && countdown.status === "paused") {
          const pauseDuration = countdown.pausedAt
            ? Date.now() - new Date(countdown.pausedAt).getTime()
            : 0;
          countdown.status = "running";
          countdown.isPaused = false;
          countdown.totalPausedDuration += pauseDuration;
          countdown.pausedAt = null;
          countdown.pauseReason = "";
          await countdown.save();
        }
        break;

      case "reset":
        if (countdown) {
          countdown.status = "not_started";
          countdown.startedAt = null;
          countdown.isPaused = false;
          countdown.pausedAt = null;
          countdown.pauseReason = "";
          countdown.totalPausedDuration = 0;
          await countdown.save();
        }
        break;

      case "end":
        if (countdown) {
          countdown.status = "ended";
          await countdown.save();
        }
        break;

      case "update":
        if (countdown) {
          Object.assign(countdown, data);
          await countdown.save();
        } else {
          countdown = new CountdownModel({
            ...DEFAULT_COUNTDOWN_STATE,
            ...data,
          });
          await countdown.save();
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Log the action
    try {
      const log = new CountdownLogModel({
        action,
        timestamp: new Date(),
        reason: data.reason,
        performedBy: data.performedBy || "admin",
        previousState,
        newState: countdown?.toObject(),
      });
      await log.save();
    } catch (logError) {
      console.error("Failed to save log:", logError);
      // Don't fail the main operation if logging fails
    }

    return NextResponse.json(countdown);
  } catch (error) {
    console.error("Error updating countdown:", error);
    return NextResponse.json(
      { error: "Failed to update countdown" },
      { status: 500 }
    );
  }
}

// PUT - Update countdown settings
export async function PUT(request: NextRequest) {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    const body = await request.json();

    let countdown: CountdownDocument | null = await CountdownModel.findOne().sort({ createdAt: -1 });

    if (!countdown) {
      countdown = new CountdownModel({
        ...DEFAULT_COUNTDOWN_STATE,
        ...body,
      });
      await countdown.save();
    } else {
      Object.assign(countdown, body);
      await countdown.save();
    }

    return NextResponse.json(countdown);
  } catch (error) {
    console.error("Error updating countdown:", error);
    return NextResponse.json(
      { error: "Failed to update countdown" },
      { status: 500 }
    );
  }
}
