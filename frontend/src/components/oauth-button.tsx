"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export default function OAuthButton({ provider }: { provider: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const providerSlug = provider.toLowerCase();

  const handleClick = () => {
    setIsLoading(true);
    window.location.href = `/api/auth/${providerSlug}/login`;
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      className="w-full rounded-xl"
    >
      {isLoading ? "Yönlendiriliyor..." : `${provider} ile Giriş Yap`}
    </Button>
  );
}
