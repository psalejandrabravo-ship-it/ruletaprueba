import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

interface RoundCompleteDialogProps {
  open: boolean;
  onNewRound: () => void;
  onModify: () => void;
  onFinish: () => void;
}

export function RoundCompleteDialog({
  open,
  onNewRound,
  onModify,
  onFinish,
}: RoundCompleteDialogProps) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 w-[min(32rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-modal focus:outline-none"
        >
          <Dialog.Title className="text-xl font-extrabold text-indigo">
            Ronda completada
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-base text-ink">
            ¡Ronda completada! Ya utilizaste todas las preguntas disponibles.
          </Dialog.Description>
          <div className="mt-6 flex flex-col gap-2">
            <Button variant="primary" size="lg" onClick={onNewRound}>
              Iniciar una nueva ronda
            </Button>
            <Button variant="secondary" onClick={onModify}>
              Modificar la actividad
            </Button>
            <Button variant="outline" onClick={onFinish}>
              Finalizar y ver resumen
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface CategoryExhaustedDialogProps {
  name: string | null;
  onBack: () => void;
}

export function CategoryExhaustedDialog({ name, onBack }: CategoryExhaustedDialogProps) {
  return (
    <Dialog.Root open={Boolean(name)} onOpenChange={(open) => !open && onBack()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(30rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-modal focus:outline-none">
          <Dialog.Title className="text-xl font-extrabold text-indigo">
            Categoría completada
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-base text-ink">
            Ya se utilizaron todas las preguntas de {name}. Puedes volver a la ruleta
            y continuar con las categorías que aún tienen preguntas.
          </Dialog.Description>
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={onBack}>
              Volver a la ruleta
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
