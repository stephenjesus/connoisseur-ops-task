import { AppShell } from "@/components/app-shell";
import { DashboardClient } from "@/components/dashboard-client";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "MANAGER") redirect("/login");

  return (
    <AppShell userName={user.name} role={user.role}>
      <DashboardClient />
    </AppShell>
  );
}
