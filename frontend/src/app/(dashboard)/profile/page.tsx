"use client";

import { useState } from "react";
import type { DashboardProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getInitialName, InitialsAvatar, pickTone } from "@/components/ui/initials-avatar";
import { DeleteAccountModal } from "@/components/features/profile/delete-account-modal";
import { useProfile } from "@/hooks/profile/use-profile";
import { useUpdateProfile } from "@/hooks/profile/use-update-profile";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const SYSTEM_AVATARS = Array.from({ length: 10 }, (_, i) => String(i + 1));

function ProfileViewSkeleton() {
  return (
    <div className="max-w-2xl space-y-5 py-6 mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
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
      <Card className="border-destructive/30">
        <CardHeader>
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-full mt-1.5" />
          <Skeleton className="h-3 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-28 rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileView({ profile, onEdit }: { profile: DashboardProfile; onEdit: () => void }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <>
      <div className="max-w-2xl space-y-5 py-6 mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Profil</CardTitle>
              <CardDescription className="mt-1">Profil bilgileriniz</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
              Düzenle
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <InitialsAvatar
                name={profile.display_name}
                avatarType={profile.avatar_type}
                size="lg"
              />
              <div className="space-y-1">
                <p className="font-medium text-sm">{profile.display_name}</p>
                {profile.bio ? (
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Biyografi eklenmemiş</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
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
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive text-sm">Tehlikeli Bölge</CardTitle>
            <CardDescription>
              Hesabınızı silerseniz tüm verileriniz kalıcı olarak kaldırılır. Bu işlem geri
              alınamaz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 className="w-4 h-4" />
              Hesabımı sil
            </Button>
          </CardContent>
        </Card>
      </div>

      <DeleteAccountModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading || !profile) return <ProfileViewSkeleton />;
  if (editing) return <ProfileForm profile={profile} onCancel={() => setEditing(false)} />;
  return <ProfileView profile={profile} onEdit={() => setEditing(true)} />;
}

function toSelectedAvatar(avatarType: string | null | undefined): string {
  if (!avatarType || avatarType === "initials") return "initials";
  return avatarType.startsWith("system_") ? avatarType.slice("system_".length) : avatarType;
}

function ProfileForm({ profile, onCancel }: { profile: DashboardProfile; onCancel: () => void }) {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [form, setForm] = useState({
    display_name: profile.display_name ?? "",
    bio: profile.bio ?? "",
    selectedAvatar: toSelectedAvatar(profile.avatar_type),
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { display_name, bio, selectedAvatar } = form;

  const initials = getInitialName(display_name || profile.display_name);
  const initialsColor = pickTone(display_name || profile.display_name);

  function handleSave() {
    updateProfile(
      {
        display_name,
        bio,
        avatar_type: selectedAvatar === "initials" ? "initials" : `system_${selectedAvatar}`,
      },
      {
        onSuccess: () => {
          toast.success("Profiliniz başarıyla güncellendi");
          onCancel();
        },
        onError: () => toast.error("Hata oluştu, tekrar deneyin"),
      },
    );
  }

  return (
    <>
      <div className="max-w-2xl space-y-5 py-6 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Baş harf veya sistem avatarından birini seçin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <InitialsAvatar
                name={display_name || profile.display_name}
                avatarType={selectedAvatar === "initials" ? "initials" : `system_${selectedAvatar}`}
                size="lg"
              />
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
            <div className="grid grid-cols-11 gap-2">
              <button
                onClick={() => setForm((f) => ({ ...f, selectedAvatar: "initials" }))}
                className={cn(
                  "aspect-square rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all",
                  initialsColor,
                  selectedAvatar === "initials"
                    ? "border-primary ring-2 ring-primary/20 scale-105"
                    : "border-border hover:border-muted-foreground",
                )}
              >
                {initials}
              </button>
              {SYSTEM_AVATARS.map((id) => (
                <button
                  key={id}
                  onClick={() => setForm((f) => ({ ...f, selectedAvatar: id }))}
                  className={cn(
                    "aspect-square rounded-full border-2 overflow-hidden transition-all",
                    selectedAvatar === id
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-border hover:border-muted-foreground",
                  )}
                >
                  <Image
                    src={`/avatars/system_${id}.svg`}
                    alt={`Avatar ${id}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
            <CardDescription>Görünen adınızı ve biyografinizi düzenleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Görünen ad</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-ring transition-shadow"
                value={display_name}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
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
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Kendinizden bahsedin..."
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
                İptal
              </Button>
              <Button onClick={handleSave} disabled={isPending} size="sm">
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
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
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive text-sm">Tehlikeli Bölge</CardTitle>
            <CardDescription>
              Hesabınızı silerseniz tüm verileriniz kalıcı olarak kaldırılır. Bu işlem geri
              alınamaz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 className="w-4 h-4" />
              Hesabımı sil
            </Button>
          </CardContent>
        </Card>
      </div>
      <DeleteAccountModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </>
  );
}
