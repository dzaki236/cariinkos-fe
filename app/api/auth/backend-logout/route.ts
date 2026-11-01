import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });
  if (!token?.backendToken) return NextResponse.json({ ok: true });
  try {
    await fetch(`${getApiBaseUrl()}/users/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.backendToken}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Sesi lokal tetap akan diakhiri." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
