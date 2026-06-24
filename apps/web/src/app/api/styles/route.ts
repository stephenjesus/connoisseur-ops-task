import { createStyle, listStyles } from "@connoisseur/db";
import { createStyleSchema } from "@connoisseur/shared";
import { fail, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireUser(request);
    const data = await listStyles();
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser(request, ["MANAGER"]);
    const body = createStyleSchema.parse(await request.json());
    const data = await createStyle(body);
    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
