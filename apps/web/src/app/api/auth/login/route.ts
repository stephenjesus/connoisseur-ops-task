import { authenticateUser } from "@connoisseur/db";
import { loginSchema } from "@connoisseur/shared";
import { fail, ok } from "@/lib/api-response";
import { COOKIE_NAME, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const user = await authenticateUser(body.email, body.password);
    const token = await signToken(user);

    const response = ok({ token, user });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    return fail(error);
  }
}
