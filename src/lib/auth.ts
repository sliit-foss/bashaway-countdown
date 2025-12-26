import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "bashaway-admin-default-key";

export function validateAdminKey(request: NextRequest): boolean {
  // Check header first
  const headerKey = request.headers.get("x-admin-key");
  if (headerKey === ADMIN_SECRET_KEY) {
    return true;
  }

  // Check query parameter
  const url = new URL(request.url);
  const queryKey = url.searchParams.get("key");
  if (queryKey === ADMIN_SECRET_KEY) {
    return true;
  }

  return false;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized. Invalid or missing admin key." },
    { status: 401 }
  );
}

export function getAdminSecretKey(): string {
  return ADMIN_SECRET_KEY;
}

