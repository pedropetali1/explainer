"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  ListChecks,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/dashboard/study", label: "Estudar", icon: BookOpen },
  { href: "/dashboard/questions", label: "Questões", icon: ListChecks },
  { href: "/dashboard/materials", label: "Materiais", icon: FileText },
  { href: "/dashboard/progress", label: "Progresso", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-sidebar">
      <div className="px-6 py-6 border-b">
        <Link href="/dashboard" className="flex items-baseline gap-2">
          <span className="font-heading text-xl tracking-tight">Explainer</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] tracking-widest uppercase text-muted-foreground">
          Navegar
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150",
                active
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-accent" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                )}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t text-[10px] tracking-widest uppercase text-muted-foreground">
        Beta
      </div>
    </aside>
  );
}
