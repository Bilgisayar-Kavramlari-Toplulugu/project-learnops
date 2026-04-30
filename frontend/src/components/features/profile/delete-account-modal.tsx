"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  toast,
} from "@/components/ui";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";

const CONFIRM_TEXT = "HESABIMI SİL";

export function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const confirmed = input === CONFIRM_TEXT;

  async function handleDelete() {
    if (!confirmed) return;

    setLoading(true);
    try {
      await api.delete("/users/me", {
        data: { confirmation: CONFIRM_TEXT },
      });
      router.push(routes.login);
    } catch {
      setLoading(false);
      toast.error("Hata oluştu, tekrar deneyin");
    }
  }

  return (
    <Modal open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <ModalContent className="max-w-[400px]">
        <ModalHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <ModalTitle className="text-base">Hesabı sil</ModalTitle>
          <ModalDescription>Tüm verileriniz kalıcı olarak silinir.</ModalDescription>
        </ModalHeader>

        <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          Bu işlem geri alınamaz.
        </div>

        <label className="block text-xs text-muted-foreground">
          Devam etmek için <strong className="text-foreground">{CONFIRM_TEXT}</strong> yazın
        </label>

        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={CONFIRM_TEXT}
        />

        <ModalFooter>
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
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
