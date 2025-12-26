import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "bashaway-admin-default-key";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (key === ADMIN_SECRET_KEY) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ valid: false }, { status: 401 });
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 });
  }
}

