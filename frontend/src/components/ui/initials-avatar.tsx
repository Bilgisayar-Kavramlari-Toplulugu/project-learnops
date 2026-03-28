"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const avatarToneClasses = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-100",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/55 dark:text-emerald-100",
  "bg-amber-100 text-amber-800 dark:bg-amber-900/55 dark:text-amber-100",
  "bg-rose-100 text-rose-800 dark:bg-rose-900/55 dark:text-rose-100",
  "bg-violet-100 text-violet-800 dark:bg-violet-900/55 dark:text-violet-100",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/55 dark:text-cyan-100",
] as const;

function toInitials(name: string | undefined | null, fallbackInitials?: string): string {
  if (!name || typeof name !== "string") {
    if (fallbackInitials?.trim()) {
      return fallbackInitials.trim().slice(0, 2).toUpperCase();
    }
    return "LO";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return "LO";
}

function pickTone(name: string | undefined | null): string {
  if (!name) return avatarToneClasses[0];

  const firstChar = name.trim().charAt(0).toUpperCase();
  if (!firstChar) return avatarToneClasses[0];

  const code = firstChar.charCodeAt(0);

  // User requested grouping:
  // A, B, C, D (65-68) -> Blue
  if (code >= 65 && code <= 68) return avatarToneClasses[0];
  // E, F, G, H (69-72) -> Green
  if (code >= 69 && code <= 72) return avatarToneClasses[1];
  // I, J, K, L (73-76) -> Purple
  if (code >= 73 && code <= 76) return avatarToneClasses[4];
  // M, N, O, P (77-80) -> Amber
  if (code >= 77 && code <= 80) return avatarToneClasses[2];
  // R, S, T, U (82-85) -> Red
  if (code >= 82 && code <= 85) return avatarToneClasses[3];
  
  // V, Y, Z, Others -> Cyan
  return avatarToneClasses[5];
}

interface InitialsAvatarProps {
  name?: string | null;
  fallbackInitials?: string;
  seed?: string;
  avatarType?: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
  fallbackClassName?: string;
}
interface InitialsAvatarProps {
  name?: string | null;
  fallbackInitials?: string;
  seed?: string;
  avatarType?: string | null;   // ← ekle
  size?: "default" | "sm" | "lg";
  className?: string;
  fallbackClassName?: string;
}

export function InitialsAvatar({
  name,
  fallbackInitials,
  seed,
  avatarType,                   // ← ekle
  size = "default",
  className,
  fallbackClassName,
}: InitialsAvatarProps) {
  const isSystemAvatar =
    avatarType && avatarType !== "initials";

  // sistem avatarı ise img render et
  if (isSystemAvatar) {
    return (
      <Avatar size={size} className={cn("border border-blue-100 dark:border-slate-700", className)}>
        <AvatarImage
          src={`/avatars/${avatarType}.svg`}
          alt={name ?? "avatar"}
        />
        <AvatarFallback className={cn("font-semibold", pickTone(name ?? seed), fallbackClassName)}>
          {toInitials(name, fallbackInitials)}
        </AvatarFallback>
      </Avatar>
    );
  }

  // initials (default)
  const initials = toInitials(name, fallbackInitials);
  const toneClass = pickTone(name ?? seed);
  return (
    <Avatar size={size} className={cn("border border-blue-100 dark:border-slate-700", className)}>
      <AvatarFallback className={cn("font-semibold", toneClass, fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
