"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { Logo } from "./logo";

const navItems = [
  { href: "/?section=neden", label: "Neden LearnOps", id: "neden" },
  { href: "/?section=kimler-icin", label: "Kimler için", id: "kimler-icin" },
  { href: "/?section=nasil-calisir", label: "Nasıl çalışır", id: "nasil-calisir" },
  { href: routes.courses, label: "Kurslara Göz At" },
  { href: routes.team, label: "Ekip" },
] as const;

const sectionNavItems = navItems.filter(
  (item): item is Extract<(typeof navItems)[number], { id: string }> => "id" in item,
);

interface SiteHeaderProps {
  initialSection?: string;
}

export function SiteHeader({ initialSection }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [activeSection, setActiveSection] = useState<string>("");

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  const replaceSectionUrl = (id: string) => {
    window.history.replaceState(null, "", `/?section=${id}`);
  };

  useEffect(() => {
    if (!isHome) return;

    if (!initialSection) return;

    requestAnimationFrame(() => scrollToSection(initialSection));
  }, [initialSection, isHome]);

  useEffect(() => {
    if (!isHome) {
      setActiveSection("");
      return;
    }

    const sections = sectionNavItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isHome]);

  const isActive = (href: string) => {
    const id = new URL(href, "https://learnops.local").searchParams.get("section");
    if (id) {
      // Anasayfada değilsek bölüm linkleri aktif olamaz — state'e bakmaya gerek yok
      if (!isHome) return false;
      return activeSection === id;
    }
    return pathname === href;
  };

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, id?: string) => {
    if (!id) return;

    event.preventDefault();
    const href = `/?section=${id}`;

    if (!isHome) {
      router.push(href);
      return;
    }

    replaceSectionUrl(id);
    scrollToSection(id);
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
                onClick={(event) => handleNavClick(event, "id" in item ? item.id : undefined)}
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
