import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { contrastText } from "@/lib/game/colors";
import { findColorName } from "@/data/category-colors";
import type { Category, Question } from "@/types/activity";

interface QuestionCardProps {
  open: boolean;
  category: Category | null;
  question: Question | null;
  onCompleted: () => void;
  onAnother: () => void;
  onBack: () => void;
}

export function QuestionCard({
  open,
  category,
  question,
  onCompleted,
  onAnother,
  onBack,
}: QuestionCardProps) {
  const color = category?.color ?? "#2B2155";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onBack();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content
          aria-describedby="question-card-text"
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 max-h-[min(36rem,calc(100dvh-1.5rem))] w-[min(34rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-6 shadow-modal focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <span
              className="size-4 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <Dialog.Title className="text-lg font-extrabold text-indigo">
              {category?.name ?? "Categoría"}
            </Dialog.Title>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Color: {findColorName(color)}
          </p>
          <p
            id="question-card-text"
            className="mt-5 rounded-xl bg-cream px-4 py-5 text-lg leading-snug font-semibold text-ink sm:text-xl"
          >
            {question?.text}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button variant="primary" size="lg" onClick={onCompleted} className="w-full">
              Completada
            </Button>
            <Button variant="secondary" onClick={onAnother} className="w-full">
              Otra de esta categoría
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full">
              Volver a la ruleta
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CategoryChip({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
      style={{ backgroundColor: color, color: contrastText(color) }}
    >
      {name}
    </span>
  );
}
