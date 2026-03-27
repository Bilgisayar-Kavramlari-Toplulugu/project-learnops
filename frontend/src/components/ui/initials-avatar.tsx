"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const avatarToneClasses = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-100",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/55 dark:text-emerald-100",
  "bg-amber-100 text-amber-800 dark:bg-amber-900/55 dark:text-amber-100",
  "bg-rose-100 text-rose-800 dark:bg-rose-900/55 dark:text-rose-100",
  "bg-violet-100 text-violet-800 dark:bg-violet-900/55 dark:text-violet-100",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/55 dark:text-cyan-100",
] as const;

function toInitials(name: string, fallbackInitials?: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  if (fallbackInitials?.trim()) {
    return fallbackInitials.trim().slice(0, 2).toUpperCase();
  }

  return "LO";
}

function pickTone(seed: string): string {
  if (!seed) {
    return avatarToneClasses[0];
  }

  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) % 2147483647;
  }

  return avatarToneClasses[Math.abs(hash) % avatarToneClasses.length];
}

interface InitialsAvatarProps {
  name: string;
  fallbackInitials?: string;
  seed?: string;
  size?: "default" | "sm" | "lg";
  className?: string;
  fallbackClassName?: string;
}

export function InitialsAvatar({
  name,
  fallbackInitials,
  seed,
  size = "default",
  className,
  fallbackClassName,
}: InitialsAvatarProps) {
  const initials = toInitials(name, fallbackInitials);
  const toneClass = pickTone(seed ?? name);

  return (
    <Avatar
      size={size}
      className={cn("border border-blue-100 dark:border-slate-700", className)}
      aria-label={`${name || "User"} avatar`}
    >
      <AvatarFallback className={cn("font-semibold", toneClass, fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
