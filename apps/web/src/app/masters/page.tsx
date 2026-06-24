import { AppShell } from "@/components/app-shell";
import { MastersView } from "@/components/masters-view";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MastersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "MANAGER") redirect("/login");

  return (
    <AppShell userName={user.name} role={user.role}>
      <MastersView />
    </AppShell>
  );
}
