"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { BundleDto, StyleDto } from "@connoisseur/shared";
import { createBundleSchema, createStyleSchema } from "@connoisseur/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { STAGE_LABELS } from "@connoisseur/shared";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

export function MastersView() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"styles" | "bundles">("styles");

  const stylesQuery = useQuery({
    queryKey: ["styles"],
    queryFn: () => fetchJson<StyleDto[]>("/api/styles"),
  });

  const bundlesQuery = useQuery({
    queryKey: ["bundles"],
    queryFn: () => fetchJson<BundleDto[]>("/api/bundles"),
  });

  const styleForm = useForm<z.infer<typeof createStyleSchema>>({
    resolver: zodResolver(createStyleSchema),
    defaultValues: { sku: "", name: "" },
  });

  const bundleForm = useForm<z.infer<typeof createBundleSchema>>({
    resolver: zodResolver(createBundleSchema),
    defaultValues: { styleId: "", quantity: 48 },
  });

  const createStyleMutation = useMutation({
    mutationFn: (values: z.infer<typeof createStyleSchema>) =>
      fetchJson<StyleDto>("/api/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      toast.success("Style created");
      styleForm.reset();
      queryClient.invalidateQueries({ queryKey: ["styles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createBundleMutation = useMutation({
    mutationFn: (values: z.infer<typeof createBundleSchema>) =>
      fetchJson<BundleDto>("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
    onSuccess: (bundle) => {
      toast.success(`Bundle ${bundle.id} created`);
      bundleForm.reset({ styleId: "", quantity: 48 });
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Masters</h1>
        <p className="mt-1 text-slate-500">Create styles and production bundles.</p>
      </div>

      <div className="flex gap-2">
        {(["styles", "bundles"] as const).map((item) => (
          <Button
            key={item}
            variant={tab === item ? "default" : "outline"}
            onClick={() => setTab(item)}
          >
            {item === "styles" ? "Styles" : "Bundles"}
          </Button>
        ))}
      </div>

      {tab === "styles" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Style</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={styleForm.handleSubmit((values) =>
                  createStyleMutation.mutate(values),
                )}
              >
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="SKU-TEE-004" {...styleForm.register("sku")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Classic Cotton Tee" {...styleForm.register("name")} />
                </div>
                <Button type="submit" disabled={createStyleMutation.isPending}>
                  Create Style
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Styles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stylesQuery.data?.map((style) => (
                <div
                  key={style.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div>
                    <p className="font-medium">{style.name}</p>
                    <p className="font-mono text-xs text-slate-500">{style.sku}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Bundle</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={bundleForm.handleSubmit((values) =>
                  createBundleMutation.mutate(values),
                )}
              >
                <div className="space-y-2">
                  <Label htmlFor="styleId">Style</Label>
                  <select
                    id="styleId"
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    {...bundleForm.register("styleId")}
                  >
                    <option value="">Select style</option>
                    {stylesQuery.data?.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.sku} — {style.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    {...bundleForm.register("quantity", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundleId">Bundle ID (optional)</Label>
                  <Input id="bundleId" placeholder="Auto-generated" {...bundleForm.register("id")} />
                </div>
                <Button type="submit" disabled={createBundleMutation.isPending}>
                  Create Bundle
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Bundles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bundlesQuery.data?.map((bundle) => (
                <div
                  key={bundle.id}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div>
                    <p className="font-mono font-medium">{bundle.id}</p>
                    <p className="text-sm text-slate-500">{bundle.style.name}</p>
                    <p className="text-xs text-slate-400">{bundle.quantity} pieces</p>
                  </div>
                  <Badge variant="indigo">{STAGE_LABELS[bundle.currentStage]}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
