import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
  href?: string | null;
  priority?: boolean;
  alt?: string;
};

export function Logo({
  className,
  width = 344,
  height = 189,
  href = "/",
  priority = false,
  alt = "LearnOps",
}: LogoProps) {
  const images = (
    <span className="inline-flex items-center h-full">
      <Image
        src="/logos/logo-light.svg"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="block dark:hidden h-full w-auto"
      />
      <Image
        src="/logos/logo-dark.svg"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="hidden dark:block h-full w-auto"
      />
    </span>
  );

  if (!href) {
    return <span className={cn("inline-flex items-center", className)}>{images}</span>;
  }

  return (
    <Link href={href} aria-label={alt} className={cn("inline-flex items-center", className)}>
      {images}
    </Link>
  );
}
