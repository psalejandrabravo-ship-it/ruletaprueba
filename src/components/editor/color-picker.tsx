import { Check } from "lucide-react";
import { CATEGORY_COLORS } from "@/data/category-colors";
import { contrastText } from "@/lib/game/colors";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  labelledBy?: string;
}

export function ColorPicker({ value, onChange, labelledBy }: ColorPickerProps) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((color) => {
        const selected = color.hex.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color.name}
            onClick={() => onChange(color.hex)}
            className={cn(
              "flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 text-[11px] font-extrabold transition-transform duration-150 active:scale-[0.96]",
              selected && "ring-2 ring-ink ring-offset-2 ring-offset-cream",
            )}
            style={{ backgroundColor: color.hex, color: contrastText(color.hex) }}
            title={color.name}
          >
            {selected ? <Check className="size-4" aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}
