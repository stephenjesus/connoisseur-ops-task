"use client";

import { useCallback, useEffect, useState } from "react";
import type { BundleDto, Stage } from "@connoisseur/shared";
import {
  STAGE_LABELS,
  getNextStage,
  PRODUCTION_STAGES,
} from "@connoisseur/shared";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shirt } from "lucide-react";

const TOKEN_KEY = "operator_token";

async function api<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (init?.token) headers.Authorization = `Bearer ${init.token}`;

  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch {
    throw new Error("Cannot reach server. Check Wi‑Fi and that the dev server is running.");
  }

  let json: { success: boolean; data?: T; error?: { message: string } };
  try {
    json = await res.json();
  } catch {
    throw new Error(`Server error (${res.status}). Try refreshing the page.`);
  }
  if (!json.success) {
    throw new Error(json.error?.message ?? "Request failed");
  }
  return json.data as T;
}

export function OperatorApp() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("operator@demo.com");
  const [password, setPassword] = useState("password123");
  const [bundleId, setBundleId] = useState("");
  const [bundle, setBundle] = useState<BundleDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setToken(localStorage.getItem(TOKEN_KEY));
    } catch {
      // Safari private mode
    }
  }, []);

  async function login() {
    setLoading(true);
    setLoginError(null);
    try {
      const data = await api<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setToken(data.token);
      try {
        localStorage.setItem(TOKEN_KEY, data.token);
      } catch {
        // Safari private mode — in-memory session still works
      }
      toast.success("Signed in");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      setLoginError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setBundle(null);
  }

  const lookupBundle = useCallback(
    async (id: string) => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await api<BundleDto>(`/api/bundles/${id.trim().toUpperCase()}`, {
          token,
        });
        setBundle(data);
        setBundleId(id.trim().toUpperCase());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Bundle not found");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  async function transition() {
    if (!bundle || !token) return;
    const next = getNextStage(bundle.currentStage);
    if (!next) return;

    setLoading(true);
    try {
      const updated = await api<BundleDto>(`/api/bundles/${bundle.id}/transition`, {
        method: "POST",
        body: JSON.stringify({ toStage: next, fromStage: bundle.currentStage }),
        token,
        headers: { "Idempotency-Key": `${bundle.id}-${next}-${Date.now()}` },
      });
      setBundle(updated);
      toast.success(`Moved to ${STAGE_LABELS[next]}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transition failed");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              <Shirt className="h-7 w-7" />
            </div>
            <CardTitle>Operator — Floor App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void login();
              }}
            >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {loginError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loginError}</p>
            )}
            <Button className="w-full min-h-12 text-base" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const next = bundle ? getNextStage(bundle.currentStage) : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-8">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Floor operator</p>
            <h1 className="text-2xl font-bold">Scan bundle</h1>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="bundleId">Bundle ID</Label>
              <Input
                id="bundleId"
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value.toUpperCase())}
                placeholder="BND-0001"
                className="font-mono text-lg min-h-12"
              />
            </div>
            <Button
              className="w-full min-h-14 text-lg"
              onClick={() => lookupBundle(bundleId)}
              disabled={loading || !bundleId.trim()}
            >
              Look up bundle
            </Button>
            <div className="flex flex-wrap gap-2">
              {["BND-0001", "BND-0003", "BND-0006"].map((id) => (
                <button
                  key={id}
                  type="button"
                  className="rounded-full bg-slate-200 px-3 py-1 font-mono text-sm"
                  onClick={() => lookupBundle(id)}
                >
                  {id}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {bundle && (
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">{bundle.id}</CardTitle>
              <p className="text-slate-500">
                {bundle.style.name} · {bundle.quantity} pcs
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[...PRODUCTION_STAGES, "COMPLETED" as Stage].map((stage) => (
                  <Badge
                    key={stage}
                    variant={bundle.currentStage === stage ? "indigo" : "default"}
                  >
                    {STAGE_LABELS[stage]}
                  </Badge>
                ))}
              </div>
              {next ? (
                <Button
                  className="w-full min-h-14 text-lg"
                  onClick={transition}
                  disabled={loading}
                >
                  Complete {STAGE_LABELS[bundle.currentStage]}
                </Button>
              ) : (
                <p className="rounded-lg bg-green-50 p-4 text-center font-medium text-green-800">
                  Bundle completed — stock updated
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
