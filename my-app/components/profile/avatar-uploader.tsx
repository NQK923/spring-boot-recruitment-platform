"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AvatarUploaderProps = {
  avatarUrl: string | null;
  fullName: string | null;
};

function createInitials(fullName: string | null): string {
  if (!fullName) {
    return "?";
  }
  const parts = fullName
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return fullName.slice(0, 1).toUpperCase();
  }
  const [first, second] = parts;
  if (!second) {
    return first.slice(0, 2).toUpperCase();
  }
  return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
}

export function AvatarUploader({ avatarUrl, fullName }: AvatarUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const initials = useMemo(() => createInitials(fullName), [fullName]);

  const handleButtonClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPG, or WEBP).");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar size must be under 2MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    try {
      setUploading(true);
      setError(null);
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error
            : "Unable to update avatar. Please try again.";
        throw new Error(message);
      }

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update avatar. Please try again.";
      setError(message);
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border bg-foreground/5">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={fullName ? `${fullName}'s avatar` : "Candidate avatar"}
            fill
            className="object-cover"
            sizes="80px"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-foreground/10 text-lg font-semibold text-text/80">
            {initials}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Change avatar"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        {!error && !avatarUrl ? (
          <p className="text-xs text-text/50">
            Recommended size 320×320. We use your social avatar if available.
          </p>
        ) : null}
      </div>
    </div>
  );
}
