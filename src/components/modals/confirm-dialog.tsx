import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import type { ConfirmRequest } from "@/store/app-store";

interface ConfirmDialogProps {
  request: ConfirmRequest | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ request, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={Boolean(request)} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-ink/45 data-[state=open]:animate-none" />
        <AlertDialog.Content
          className="fixed top-1/2 left-1/2 z-[60] w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-modal focus:outline-none"
        >
          <AlertDialog.Title className="text-xl font-extrabold text-indigo">
            {request?.title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-3 text-base text-ink">
            {request?.description}
          </AlertDialog.Description>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant={request?.danger ? "danger" : "primary"}
                className="w-full sm:w-auto"
                onClick={onConfirm}
              >
                {request?.confirmLabel ?? "Continuar"}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
