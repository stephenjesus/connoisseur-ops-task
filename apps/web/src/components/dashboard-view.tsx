"use client";

import type { DashboardDto } from "@connoisseur/shared";
import {
  LOCATION_LABELS,
  PRODUCTION_STAGES,
  STAGE_COLORS,
  STAGE_LABELS,
} from "@connoisseur/shared";
import { ArrowRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const colorMap = {
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  blue: "border-blue-200 bg-blue-50 text-blue-900",
  purple: "border-purple-200 bg-purple-50 text-purple-900",
  green: "border-green-200 bg-green-50 text-green-900",
};

export function DashboardView({ data }: { data: DashboardDto }) {
  const productionStages = PRODUCTION_STAGES;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Production Dashboard
        </h1>
        <p className="mt-1 text-slate-500">
          Live work-in-progress and stock across the factory floor.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          WIP Pipeline
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {productionStages.map((stage, index) => {
            const color = STAGE_COLORS[stage];
            return (
              <Card
                key={stage}
                className={`relative overflow-hidden border-2 ${colorMap[color as keyof typeof colorMap]}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{STAGE_LABELS[stage]}</CardTitle>
                    <Badge variant={color as "amber" | "blue" | "purple" | "green"}>
                      Stage {index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{data.wipByStage[stage]}</p>
                  <p className="mt-1 text-sm opacity-80">bundles in queue</p>
                </CardContent>
                {index < productionStages.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-300 xl:block" />
                )}
              </Card>
            );
          })}
        </div>
        <Card className="mt-4 border-dashed">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium">Completed bundles</p>
                <p className="text-sm text-slate-500">Moved to stock</p>
              </div>
            </div>
            <p className="text-2xl font-bold">{data.wipByStage.COMPLETED}</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Stock on Hand
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="p-4 font-medium">SKU</th>
                      <th className="p-4 font-medium">Style</th>
                      <th className="p-4 font-medium">Location</th>
                      <th className="p-4 text-right font-medium">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stock.map((row) => (
                      <tr key={`${row.styleId}-${row.location}`} className="border-b last:border-0">
                        <td className="p-4 font-mono text-xs">{row.style.sku}</td>
                        <td className="p-4">{row.style.name}</td>
                        <td className="p-4">{LOCATION_LABELS[row.location]}</td>
                        <td className="p-4 text-right font-semibold">{row.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divide-y md:hidden">
                {data.stock.map((row) => (
                  <div key={`${row.styleId}-${row.location}`} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{row.style.name}</p>
                        <p className="font-mono text-xs text-slate-500">{row.style.sku}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {LOCATION_LABELS[row.location]}
                        </p>
                      </div>
                      <p className="text-xl font-bold">{row.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent Activity
          </h2>
          <Card>
            <CardContent className="divide-y p-0">
              {data.recentActivity.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">No transitions yet.</p>
              ) : (
                data.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 p-4">
                    <div>
                      <p className="font-medium">{item.bundle.id}</p>
                      <p className="text-sm text-slate-500">{item.bundle.style.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.user.name} · {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{STAGE_LABELS[item.fromStage]}</p>
                      <p className="text-slate-400">→</p>
                      <p className="font-medium">{STAGE_LABELS[item.toStage]}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
