"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, Package, Shirt, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/masters", label: "Masters", icon: Package },
];

export function AppShell({
  children,
  userName,
  role,
}: {
  children: React.ReactNode;
  userName: string;
  role: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1 p-4">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:flex">
        <aside className="hidden w-64 shrink-0 bg-slate-950 text-white lg:sticky lg:top-0 lg:block lg:h-screen">
          <div className="flex items-center gap-3 border-b border-slate-800 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <Shirt className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Connoisseur Ops</p>
              <p className="text-xs text-slate-400">Production Control</p>
            </div>
          </div>
          <NavLinks />
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <aside className="relative h-full w-72 bg-slate-950 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 p-4">
                <span className="font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-slate-800"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <p className="text-sm text-slate-500">Welcome back</p>
                  <p className="font-semibold text-slate-900">{userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {role}
                </span>
                <LogoutButton />
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
