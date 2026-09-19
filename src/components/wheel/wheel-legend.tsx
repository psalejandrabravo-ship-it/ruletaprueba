import { contrastText } from "@/lib/game/colors";
import { abbreviateName } from "@/lib/game/abbreviate";
import type { Category } from "@/types/activity";

interface WheelLegendProps {
  categories: Category[];
  abbreviated: boolean;
}

export function WheelLegend({ categories, abbreviated }: WheelLegendProps) {
  if (!abbreviated) return null;

  return (
    <ul className="mx-auto mt-4 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Categorías de la ruleta">
      {categories.map((category) => (
        <li key={category.id} className="flex items-center gap-2 text-sm text-ink">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold"
            style={{
              backgroundColor: category.color,
              color: contrastText(category.color),
            }}
            aria-hidden="true"
          >
            {abbreviateName(category.name)}
          </span>
          <span className="min-w-0 truncate font-semibold">{category.name}</span>
        </li>
      ))}
    </ul>
  );
}
