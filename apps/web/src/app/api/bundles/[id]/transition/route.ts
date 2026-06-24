import { transitionBundle } from "@connoisseur/db";
import { transitionSchema } from "@connoisseur/shared";
import { fail, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request, ["OPERATOR", "MANAGER"]);
    const { id } = await params;
    const body = transitionSchema.parse(await request.json());
    const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

    const data = await transitionBundle(
      id,
      user.id,
      body.toStage,
      body.fromStage,
      idempotencyKey,
    );
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
