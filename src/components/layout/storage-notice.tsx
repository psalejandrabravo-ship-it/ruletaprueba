import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StorageNotice } from "@/types/activity";

interface StorageNoticeBannerProps {
  notice: StorageNotice;
  onDismiss: () => void;
}

export function StorageNoticeBanner({ notice, onDismiss }: StorageNoticeBannerProps) {
  if (notice === "none") return null;

  const message =
    notice === "unavailable"
      ? "Este navegador no pudo guardar la configuración. Puedes usar la actividad ahora, pero los cambios podrían no conservarse."
      : "Se restauró una configuración válida porque los datos locales estaban incompletos o dañados.";

  return (
    <div
      role="status"
      className="mx-4 mb-2 flex items-start gap-3 rounded-xl bg-surface px-4 py-3 text-sm text-ink shadow-card sm:mx-6"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-indigo" aria-hidden="true" />
      <p className="flex-1 leading-snug">{message}</p>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 shrink-0"
        onClick={onDismiss}
        aria-label="Cerrar aviso"
      >
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
