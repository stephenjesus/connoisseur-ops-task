import { fail, ok } from "@/lib/api-response";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = ok({ success: true });
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
