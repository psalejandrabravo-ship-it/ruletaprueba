import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HowToPlayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: () => void;
}

const STEPS = [
  "Prepara las categorías y preguntas.",
  "Inicia la actividad.",
  "Gira la ruleta.",
  "Conversen a partir de la pregunta mostrada.",
  "Marca la pregunta como completada o vuelve a la ruleta.",
  "Finaliza cuando quieras para ver un resumen general.",
];

export function HowToPlayModal({ open, onOpenChange, onCloseAutoFocus }: HowToPlayModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content
          aria-describedby="how-to-play-desc"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onCloseAutoFocus?.();
          }}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[min(36rem,calc(100dvh-2rem))] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-surface shadow-modal focus:outline-none"
        >
          <div className="flex items-start justify-between gap-3 px-6 pt-6">
            <Dialog.Title className="text-xl font-extrabold text-indigo">
              Cómo jugar
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Cerrar">
                <X className="size-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description id="how-to-play-desc" className="sr-only">
            Pasos breves para preparar y realizar la actividad.
          </Dialog.Description>
          <ol className="space-y-3 overflow-y-auto px-6 py-4">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-base text-ink">
                <span
                  className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo text-sm font-extrabold text-cream tabular-nums"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex justify-end px-6 pb-6">
            <Dialog.Close asChild>
              <Button variant="primary">Entendido</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
