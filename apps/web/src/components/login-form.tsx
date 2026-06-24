"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@connoisseur/shared";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Shirt } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "manager@demo.com",
      password: "password123",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error.message);
        return;
      }
      toast.success("Signed in");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Unable to sign in");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Shirt className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Connoisseur Ops</CardTitle>
          <CardDescription>Manager dashboard sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
            </div>
            <Button className="w-full" size="lg" type="submit">
              Sign in
            </Button>
          </form>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium">Demo accounts</p>
            <p className="mt-1">Manager: manager@demo.com</p>
            <p>Operator: operator@demo.com</p>
            <p className="mt-1 text-slate-400">Password: password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
