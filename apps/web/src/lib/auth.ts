import type { AuthUser, Role } from "@connoisseur/shared";
import { ForbiddenError, UnauthorizedError } from "@connoisseur/shared";
import { getUserById } from "@connoisseur/db";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "connoisseur_token";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signToken(user: AuthUser) {
  return new SignJWT({ sub: user.id, role: user.role, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  const userId = payload.sub;
  if (!userId) throw new UnauthorizedError();
  const user = await getUserById(userId);
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export async function requireUser(
  request: NextRequest,
  roles?: Role[],
): Promise<AuthUser> {
  const bearer = getBearerToken(request);
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(COOKIE_NAME)?.value;
  const token = bearer ?? cookieToken;
  if (!token) throw new UnauthorizedError();

  const user = await verifyToken(token);
  if (roles && !roles.includes(user.role)) {
    throw new ForbiddenError();
  }
  return user;
}

export { COOKIE_NAME };
