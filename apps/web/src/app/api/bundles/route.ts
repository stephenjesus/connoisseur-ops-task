import { createBundle, listBundles } from "@connoisseur/db";
import { createBundleSchema } from "@connoisseur/shared";
import { fail, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireUser(request);
    const data = await listBundles();
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser(request, ["MANAGER"]);
    const body = createBundleSchema.parse(await request.json());
    const data = await createBundle(body);
    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
