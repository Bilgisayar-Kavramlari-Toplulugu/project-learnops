"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitialsColor, getInitials } from "@/components/ui/avatar-component";
import { pickTone } from "@/components/ui/initials-avatar";
import { DeleteAccountModal } from "@/components/features/profile/delete-account-modal";
import { useProfile } from "@/hooks/profile/use-profile";
import { useUpdateProfile } from "@/hooks/profile/use-update-profile";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const SYSTEM_AVATARS = Array.from({ length: 10 }, (_, i) => String(i + 1));

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl space-y-5 py-6 mx-auto">

      {/* Avatar skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>
            Baş harf veya sistem avatarından birini seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <div className="grid grid-cols-11 gap-2">
            {Array.from({ length: 11 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profil bilgileri skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgileri</CardTitle>
          <CardDescription>
            Görünen adınızı ve biyografinizi düzenleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-[68px] w-full rounded-md" />
            <div className="flex justify-end">
              <Skeleton className="h-2 w-8" />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Hesap bilgileri skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Hesap Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex justify-between items-center py-2.5 border-b">
              <Skeleton className="h-2.5 w-6" />
              <Skeleton className="h-2.5 w-36" />
            </div>
            <div className="flex justify-between items-center py-2.5">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-2.5 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone skeleton */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive text-sm">
            Tehlikeli Bölge
          </CardTitle>
          <CardDescription>
            Hesabınızı silerseniz tüm verileriniz kalıcı olarak kaldırılır.
            Bu işlem geri alınamaz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-28 rounded-md" />
        </CardContent>
      </Card>

    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [display_name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setSelectedAvatar(profile.avatar_type ?? "");
    }
  }, [profile]);

  if (isLoading || !profile) return <ProfileSkeleton />;

  const initials = getInitials(display_name || profile.display_name);
  const initialsColor = pickTone(display_name || profile.display_name);

  function handleSave() {
    updateProfile(
      { display_name, bio, avatar_type: `system_${selectedAvatar}` },
      {
        onSuccess: () => toast.success("Profiliniz başarıyla güncellendi"),
        onError: () => toast.error("Hata oluştu, tekrar deneyin"),
      }
    );
  }

  return (
    <>
      <div className="max-w-2xl space-y-5 py-6 mx-auto">

        {/* Avatar seçimi */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>
              Baş harf veya sistem avatarından birini seçin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Önizleme */}
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                {selectedAvatar !== "initials" && (
                  <AvatarImage
                    src={`/avatars/system_${selectedAvatar}.svg`}
                    alt="Seçili avatar"
                  />
                )}
                <AvatarFallback className={cn("text-sm font-medium", initialsColor)}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  {display_name || profile.display_name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedAvatar === "initials"
                    ? "Baş harf avatarı"
                    : `Sistem avatarı ${selectedAvatar}`}
                </p>
              </div>
            </div>

            {/* Seçici grid */}
            <div className="grid grid-cols-11 gap-2">
              <button
                onClick={() => setSelectedAvatar("initials")}
                className={cn(
                  "aspect-square rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all",
                  initialsColor,
                  selectedAvatar === "initials"
                    ? "border-primary ring-2 ring-primary/20 scale-105"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                {initials.charAt(0)}
              </button>

              {SYSTEM_AVATARS.map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedAvatar(id)}
                  className={cn(
                    "aspect-square rounded-full border-2 overflow-hidden transition-all",
                    selectedAvatar === id
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <img
                    src={`/avatars/system_${id}.svg`}
                    alt={`Avatar ${id}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profil bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
            <CardDescription>
              Görünen adınızı ve biyografinizi düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Görünen ad</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow"
                value={display_name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Biyografi</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
                rows={3}
                maxLength={200}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Kendinizden bahsedin..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/200
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button onClick={handleSave} disabled={isPending} size="sm">
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hesap bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Hesap Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-0 text-sm">
              {[
                { label: "ID", value: profile.id },
                { label: "E-posta", value: profile.email },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-1.5 border-b last:border-0"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Tehlikeli bölge */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive text-sm">
              Tehlikeli Bölge
            </CardTitle>
            <CardDescription>
              Hesabınızı silerseniz tüm verileriniz kalıcı olarak kaldırılır.
              Bu işlem geri alınamaz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              Hesabımı sil
            </Button>
          </CardContent>
        </Card>

      </div>

      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </>
  );
}