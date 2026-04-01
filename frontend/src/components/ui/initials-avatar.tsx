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

export function getInitialName(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function toInitials(name: string | undefined | null, fallbackInitials?: string): string {
  if (!name || typeof name !== "string" || !name.trim()) {
    return fallbackInitials?.trim() ? getInitialName(fallbackInitials) : "LO";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  const initials = parts.map((part) => part[0].toUpperCase()).join("");

  return initials || "LO";
}

export function pickTone(name: string | undefined | null): string {
  if (!name) return avatarToneClasses[0];

  const firstChar = name.trim().charAt(0).toUpperCase();
  if (!firstChar) return avatarToneClasses[0];

  const code = firstChar.charCodeAt(0);

  if (code >= 65 && code <= 68) return avatarToneClasses[0];
  if (code >= 69 && code <= 72) return avatarToneClasses[1];
  if (code >= 73 && code <= 76) return avatarToneClasses[4];
  if (code >= 77 && code <= 80) return avatarToneClasses[2];
  if (code >= 82 && code <= 85) return avatarToneClasses[3];

  return avatarToneClasses[5];
}

interface InitialsAvatarProps {
  name?: string | null;
  fallbackInitials?: string;
  avatarType?: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
  fallbackClassName?: string;
}

export function InitialsAvatar({
  name,
  fallbackInitials,
  avatarType,
  size = "default",
  className,
  fallbackClassName,
}: InitialsAvatarProps) {
  const isSystemAvatar = avatarType && avatarType !== "initials";
  const initials = toInitials(name, fallbackInitials);
  const toneClass = pickTone(name);

  if (isSystemAvatar) {
    return (
      <Avatar size={size} className={cn("border border-blue-100 dark:border-slate-700", className)}>
        <AvatarImage src={`/avatars/${avatarType}.svg`} alt={name ?? "avatar"} />
        <AvatarFallback className={cn("font-semibold", toneClass, fallbackClassName)}>
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Initials branch: render directly without AvatarFallback.
  // AvatarFallback relies on Radix's imageLoadingStatus — if a system avatar was
  // previously loaded in this Avatar root, the status stays "loaded" and the
  // fallback never renders. Bypassing it avoids this stale-state issue entirely.
  return (
    <Avatar size={size} className={cn("border border-blue-100 dark:border-slate-700", className)}>
      <span
        className={cn(
          "flex size-full items-center justify-center rounded-full font-semibold text-sm group-data-[size=sm]/avatar:text-xs",
          toneClass,
          fallbackClassName,
        )}
      >
        {initials}
      </span>
    </Avatar>
  );
}
