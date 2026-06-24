import { getDashboard } from "@connoisseur/db";
import { fail, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireUser(request, ["MANAGER"]);
    const data = await getDashboard();
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
