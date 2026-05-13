"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export default function OAuthButton({
  provider,
  icon,
  comingSoon = false,
}: {
  provider: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const providerSlug = provider.toLowerCase();

  const handleClick = () => {
    if (comingSoon) return;
    setIsLoading(true);
    window.location.href = `/api/auth/${providerSlug}/login`;
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading || comingSoon}
      variant="outline"
      className="w-full rounded-xl"
    >
      {!isLoading && (
        <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>
      )}
      <span>
        {isLoading
          ? "Yönlendiriliyor..."
          : comingSoon
            ? `${provider} ile Giriş Yap — Yakında`
            : `${provider} ile Giriş Yap`}
      </span>
    </Button>
  );
}
