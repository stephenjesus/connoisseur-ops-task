import { getBundleById } from "@connoisseur/db";
import { fail, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request);
    const { id } = await params;
    const data = await getBundleById(id);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
