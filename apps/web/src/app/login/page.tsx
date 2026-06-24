import { LoginForm } from "@/components/login-form";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");
  return <LoginForm />;
}
