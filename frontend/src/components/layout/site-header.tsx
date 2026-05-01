"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LogIn } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

const navItems = [
  { href: "/#neden", label: "Neden LearnOps" },
  { href: "/#kimler-icin", label: "Kimler için" },
  { href: "/#nasil-calisir", label: "Nasıl çalışır" },
  { href: "/team", label: "Ekip" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href;
  };

  return (
    <header className="sticky top-3 z-30">
      <div className="flex items-center justify-between rounded-full border border-border/50 bg-background/80 px-5 py-2 shadow-sm backdrop-blur-md">
        <Link href={routes.root} className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="size-3.5" />
          </div>
          <span className="text-sm font-bold tracking-wide">LearnOps</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1 text-[13px] transition-colors ${
                isActive(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="h-8 rounded-full text-xs">
            <Link href={routes.login}>
              <LogIn className="size-3" />
              Giriş
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden h-8 rounded-full text-xs sm:flex">
            <Link href={routes.login}>Başla</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}