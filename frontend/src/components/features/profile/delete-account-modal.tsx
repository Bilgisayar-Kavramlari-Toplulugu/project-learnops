"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner"

const CONFIRM_TEXT = "HESABIMI-SİL";

export function DeleteAccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const confirmed = input === CONFIRM_TEXT;

  async function handleDelete() {
    if (!confirmed) return;
    setLoading(true);
    try {
      await api.delete("/api/account").then(() => {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
        router.push(routes.login);
      });
    } catch {
      setLoading(false);
      toast.error("Hata oluştu, tekrar deneyin")
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[400px] max-w-[90vw] rounded-xl border border-border bg-background p-6 shadow-lg">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>

        <h2 className="mb-1 text-base font-medium text-foreground">
          Hesabı sil
        </h2>

        <p className="mb-2 text-sm text-muted-foreground">
          Tüm verileriniz kalıcı olarak silinir.
        </p>

        <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          Bu işlem geri alınamaz.
        </div>

        <label className="mb-1.5 block text-xs text-muted-foreground">
          Devam etmek için <strong className="text-foreground">{CONFIRM_TEXT}</strong> yazın
        </label>

        <input
          className="mb-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={CONFIRM_TEXT}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            İptal
          </Button>

          <Button
            variant="destructive"
            size="sm"
            disabled={!confirmed || loading}
            onClick={handleDelete}
          >
            {loading ? "Siliniyor..." : "Hesabı sil"}
          </Button>
        </div>
      </div>
    </div>
  );
}