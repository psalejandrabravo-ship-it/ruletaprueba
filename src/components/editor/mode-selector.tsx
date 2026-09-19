import { cn } from "@/lib/utils";
import type { ContentMode } from "@/types/activity";

interface ModeSelectorProps {
  mode: ContentMode;
  onChange: (mode: ContentMode) => void;
}

const OPTIONS: { id: ContentMode; title: string; description: string }[] = [
  {
    id: "included",
    title: "Usar contenido incluido",
    description: "Activa o desactiva las categorías predeterminadas sin editarlas.",
  },
  {
    id: "custom",
    title: "Personalizar contenido",
    description: "Crea, edita y organiza categorías y preguntas para esta actividad.",
  },
];

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-indigo">Modalidad</legend>
      <div className="grid gap-3 md:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = mode === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-2xl bg-surface p-4 shadow-card transition-transform duration-150 active:scale-[0.99]",
                selected && "ring-2 ring-coral ring-offset-2 ring-offset-cream",
              )}
            >
              <input
                type="radio"
                name="content-mode"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="mt-1 size-4 accent-coral"
              />
              <span>
                <span className="block font-extrabold text-indigo">{option.title}</span>
                <span className="mt-1 block text-sm text-ink-muted">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
