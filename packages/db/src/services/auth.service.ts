import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import type { AuthUser } from "@connoisseur/shared";
import { UnauthorizedError } from "@connoisseur/shared";

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
