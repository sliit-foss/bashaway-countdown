import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CountdownLogModel from "@/lib/models/CountdownLog";

// GET - Fetch countdown logs
export async function GET() {
  try {
    await dbConnect();

    const logs = await CountdownLogModel.find()
      .sort({ timestamp: -1 })
      .limit(50);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    // Return empty array instead of error to not break the UI
    return NextResponse.json([]);
  }
}
