"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Globe, ArrowUpRight } from "lucide-react";

import { teamMembers, type TeamMember } from "@/data/team";

const gradients = [
  "from-rose-500/50 via-fuchsia-500/30 to-indigo-500/50",
  "from-amber-500/50 via-orange-500/30 to-rose-500/50",
  "from-emerald-500/50 via-teal-500/30 to-cyan-500/50",
  "from-blue-500/50 via-indigo-500/30 to-violet-500/50",
  "from-fuchsia-500/50 via-pink-500/30 to-rose-500/50",
  "from-cyan-500/50 via-sky-500/30 to-blue-500/50",
  "from-lime-500/50 via-emerald-500/30 to-teal-500/50",
  "from-violet-500/50 via-purple-500/30 to-fuchsia-500/50",
] as const;

const linkConfig = {
  website: { icon: Globe, label: "Website" },
  github: { icon: Github, label: "GitHub" },
  linkedin: { icon: Linkedin, label: "LinkedIn" },
} as const;

type LinkKey = keyof typeof linkConfig;

const ABOVE_THE_FOLD_COUNT = 4;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function getPrimaryLink(links: TeamMember["links"]): string | null {
  if (!links) return null;
  return links.website ?? links.github ?? links.linkedin ?? null;
}

function SocialButton({
  kind,
  href,
  memberName,
}: {
  kind: LinkKey;
  href: string;
  memberName: string;
}) {
  const { icon: Icon, label } = linkConfig[kind];
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${memberName} - ${label}`}
      onClick={(e) => e.stopPropagation()}
      className="flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <Icon className="size-4" />
    </Link>
  );
}

function MemberCard({
  member,
  index,
  isPriority,
}: {
  member: TeamMember;
  index: number;
  isPriority: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const gradient = gradients[index % gradients.length];

  const links = member.links ?? {};
  const orderedLinks: Array<[LinkKey, string]> = (
    ["website", "github", "linkedin"] as const
  )
    .filter((k) => Boolean(links[k]))
    .map((k) => [k, links[k] as string]);

  const primaryHref = getPrimaryLink(member.links);

  // Kart içeriği — wrapper'a bağlı olmadan render edilir
  const cardInner = (
    <>
      <div className="relative aspect-[4/5]">
        {!imgError ? (
          <Image
            src={`/team/${member.slug}.jpg`}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={isPriority}
            loading={isPriority ? "eager" : "lazy"}
            onError={() => setImgError(true)}
            className="object-cover transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
          >
            <span className="text-4xl font-bold text-white drop-shadow-lg sm:text-5xl">
              {getInitials(member.name)}
            </span>
          </div>
        )}

        {/* Renkli overlay */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} mix-blend-overlay opacity-0 transition-opacity duration-500 group-hover:opacity-70`}
          aria-hidden
        />

        {/* Alt karartma */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
          aria-hidden
        />

        {/* Sağ üst — tıklanabilirse arrow ikonu (visual cue) */}
        {primaryHref && (
          <div className="pointer-events-none absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </div>
        )}

        {/* İçerik */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-base font-semibold text-white drop-shadow-md sm:text-lg">
            {member.name}
          </h3>
          {member.tagline && (
            <p className="mt-0.5 text-xs text-white/85 drop-shadow sm:text-sm">
              {member.tagline}
            </p>
          )}

          {orderedLinks.length > 0 && (
            <div className="mt-3 flex gap-2">
              {orderedLinks.map(([kind, href]) => (
                <SocialButton
                  key={kind}
                  kind={kind}
                  href={href}
                  memberName={member.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const baseClasses =
    "group relative block overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-in fade-in zoom-in-95";

  const animationStyle = {
    animationDelay: `${index * 60}ms`,
    animationFillMode: "both" as const,
    animationDuration: "500ms",
  };

  // Primary link varsa kart bir <a>, yoksa normal <div>
  if (primaryHref) {
    return (
      <Link
        href={primaryHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${member.name} profilini aç`}
        className={`${baseClasses} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70`}
        style={animationStyle}
      >
        {cardInner}
      </Link>
    );
  }

  return (
    <div className={baseClasses} style={animationStyle}>
      {cardInner}
    </div>
  );
}

export function TeamSection() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {teamMembers.map((m, i) => (
        <MemberCard
          key={m.slug}
          member={m}
          index={i}
          isPriority={i < ABOVE_THE_FOLD_COUNT}
        />
      ))}
    </div>
  );
}