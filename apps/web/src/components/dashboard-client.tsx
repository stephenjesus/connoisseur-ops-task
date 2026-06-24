"use client";

import type { DashboardDto } from "@connoisseur/shared";
import { useQuery } from "@tanstack/react-query";
import { DashboardView } from "@/components/dashboard-view";

async function fetchDashboard(): Promise<DashboardDto> {
  const res = await fetch("/api/dashboard");
  const json = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

export function DashboardClient() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load dashboard.
      </div>
    );
  }

  return <DashboardView data={data} />;
}
