import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(process.env.GHL_PRIVATE_TOKEN && process.env.GHL_LOCATION_ID),
    generatedAt: new Date().toISOString()
  });
}
