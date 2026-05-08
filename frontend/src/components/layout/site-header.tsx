"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { Logo } from "./logo";

const navItems = [
  { href: "/#neden", label: "Neden LearnOps", id: "neden" },
  { href: "/#kimler-icin", label: "Kimler için", id: "kimler-icin" },
  { href: "/#nasil-calisir", label: "Nasıl çalışır", id: "nasil-calisir" },
  { href: "/team", label: "Ekip" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Anasayfa değilsek observer'ı hiç kurma — setState de yapma
    if (!isHome) return;

    const sectionIds = navItems
      .filter((i): i is typeof i & { id: string } => "id" in i)
      .map((i) => i.id);

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isHome]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      // Anasayfada değilsek hash linkler aktif olamaz — state'e bakmaya gerek yok
      if (!isHome) return false;
      const id = href.replace("/#", "");
      return activeSection === id;
    }
    return pathname === href;
  };

  return (
    <header className="sticky top-3 z-30">
      <div className="flex items-center justify-between rounded-full border border-border/50 bg-background/80 px-5 py-2 shadow-sm backdrop-blur-md">
        <Logo
          href={routes.root}
          width={180}
          height={100}
          priority
          className="h-10 w-auto md:h-12"
        />

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1 text-[13px] transition-colors ${
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
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
