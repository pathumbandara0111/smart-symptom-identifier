import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, signAdminToken, verifyAdminToken } from "@/lib/adminAuth";
import { clearKey, clientIp, isLocked, recordFailure } from "@/lib/rateLimit";

const MAX_FAILS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const lockKey = `admin-login:${clientIp(request)}:${username.toLowerCase()}`;
    const lock = isLocked(lockKey, MAX_FAILS);
    if (lock.locked) {
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${Math.ceil(lock.retryAfterSec / 60)} minute(s).` },
        { status: 429, headers: { "Retry-After": String(lock.retryAfterSec) } }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    // Always run a bcrypt compare so response time does not reveal valid usernames
    const hash = admin?.password ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
    const valid = await bcrypt.compare(password, hash);

    if (!admin || !valid) {
      recordFailure(lockKey, LOCK_WINDOW_MS);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    clearKey(lockKey);
    const response = NextResponse.json({ success: true, message: "Admin logged in successfully" });
    response.cookies.set(ADMIN_COOKIE, await signAdminToken(admin.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_SECONDS,
    });
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
