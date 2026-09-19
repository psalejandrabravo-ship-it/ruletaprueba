import { useEffect, useRef, useState } from "react";
import { abbreviateName, shouldAbbreviateLabels, wrapLabel } from "@/lib/game/abbreviate";
import { contrastText } from "@/lib/game/colors";
import { cn } from "@/lib/utils";
import { WheelLegend } from "@/components/wheel/wheel-legend";
import type { Category } from "@/types/activity";

interface SituationWheelProps {
  categories: Category[];
  rotation: number;
  spinning: boolean;
  durationMs: number;
  instant?: boolean;
  onSpinEnd?: () => void;
}

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

export function SituationWheel({
  categories,
  rotation,
  spinning,
  durationMs,
  instant = false,
  onSpinEnd,
}: SituationWheelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(360);
  const endedRef = useRef(false);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 360;
      setSize(width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!spinning) {
      endedRef.current = false;
      return;
    }
    endedRef.current = false;
    const timeout = window.setTimeout(() => {
      if (!endedRef.current) {
        endedRef.current = true;
        onSpinEnd?.();
      }
    }, durationMs + 80);
    return () => window.clearTimeout(timeout);
  }, [spinning, durationMs, onSpinEnd, rotation]);

  const count = Math.max(categories.length, 1);
  const slice = 360 / count;
  const abbreviated = shouldAbbreviateLabels(categories.length, size);

  const label = `Ruleta con ${categories.length} categorías: ${categories
    .map((category) => category.name)
    .join(", ")}`;

  return (
    <div className="mx-auto w-full max-w-[28rem]">
      <div
        ref={wrapRef}
        className="relative mx-auto aspect-square w-full max-w-[min(48vh,26rem)] pointer-events-none"
      >
        <div
          className="pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-[6%]"
          aria-hidden="true"
        >
          <svg width="28" height="34" viewBox="0 0 28 34">
            <polygon points="14,34 3,4 25,4" fill="#2B2155" />
            <rect x="8" y="0" width="12" height="8" rx="2" fill="#2B2155" />
            <circle cx="14" cy="4" r="3" fill="#E6B84C" />
          </svg>
        </div>

        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label={label}
          className={cn("wheel-disk h-full w-full origin-center will-change-transform")}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: instant
              ? "none"
              : `transform ${durationMs}ms var(--ease-wheel)`,
          }}
          onTransitionEnd={(event) => {
            if (event.propertyName !== "transform") return;
            if (!spinning || endedRef.current) return;
            endedRef.current = true;
            onSpinEnd?.();
          }}
        >
          <circle cx="50" cy="50" r="49" fill="#F7F1E6" />
          {categories.map((category, index) => {
            const start = index * slice;
            const end = start + slice;
            const mid = start + slice / 2;
            const labelPos = polar(50, 50, 30, mid);
            let textAngle = mid;
            if (mid > 90 && mid < 270) textAngle = mid + 180;
            const lines = abbreviated
              ? [abbreviateName(category.name)]
              : wrapLabel(category.name);
            const fontSize = abbreviated ? 5.2 : lines.length > 1 ? 3.6 : 4.2;

            return (
              <g key={category.id}>
                <path
                  d={slicePath(50, 50, 47, start, end)}
                  fill={category.color}
                  stroke="#F7F1E6"
                  strokeWidth="0.6"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill={contrastText(category.color)}
                  fontSize={fontSize}
                  fontWeight={800}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textAngle} ${labelPos.x} ${labelPos.y})`}
                >
                  {lines.map((line, lineIndex) => (
                    <tspan
                      key={`${line}-${lineIndex}`}
                      x={labelPos.x}
                      dy={
                        lineIndex === 0
                          ? lines.length > 1
                            ? -fontSize * 0.55
                            : 0
                          : fontSize * 1.15
                      }
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
          <circle cx="50" cy="50" r="9.5" fill="#F7F1E6" />
          <circle cx="50" cy="50" r="7.4" fill="#2B2155" />
          <circle cx="50" cy="50" r="2.7" fill="#E6B84C" />
        </svg>
      </div>
      <WheelLegend categories={categories} abbreviated={abbreviated} />
    </div>
  );
}
