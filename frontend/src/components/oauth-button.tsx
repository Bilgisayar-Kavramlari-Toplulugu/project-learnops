"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export default function OAuthButton({
  provider,
  comingSoon = false,
}: {
  provider: string;
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
      {isLoading
        ? "Yönlendiriliyor..."
        : comingSoon
          ? `${provider} ile Giriş Yap — Yakında`
          : `${provider} ile Giriş Yap`}
    </Button>
  );
}
