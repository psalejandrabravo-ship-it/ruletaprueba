import { contrastText } from "@/lib/game/colors";

const PREVIEW = [
  { color: "#E07A5F", start: 0, end: 90 },
  { color: "#2F7D73", start: 90, end: 180 },
  { color: "#E6B84C", start: 180, end: 270 },
  { color: "#5C4E86", start: 270, end: 360 },
];

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

export function WheelPreview() {
  return (
    <div className="relative mx-auto w-[min(16rem,70vw)]" aria-hidden="true">
      <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1">
        <svg width="22" height="28" viewBox="0 0 22 28" className="drop-shadow-sm">
          <polygon points="11,28 2,4 20,4" fill="#2B2155" />
          <circle cx="11" cy="6" r="3" fill="#E6B84C" />
        </svg>
      </div>
      <svg viewBox="0 0 100 100" className="h-auto w-full">
        <circle cx="50" cy="50" r="48" fill="#F7F1E6" />
        {PREVIEW.map((segment) => (
          <path
            key={segment.color}
            d={slicePath(50, 50, 46, segment.start, segment.end)}
            fill={segment.color}
          />
        ))}
        <circle cx="50" cy="50" r="10" fill="#F7F1E6" />
        <circle cx="50" cy="50" r="3.2" fill="#E6B84C" />
      </svg>
    </div>
  );
}

export function WheelHub() {
  return (
    <>
      <circle cx="50" cy="50" r="9" fill="#F7F1E6" />
      <circle cx="50" cy="50" r="7.2" fill="#2B2155" />
      <circle cx="50" cy="50" r="2.6" fill="#E6B84C" />
    </>
  );
}

export { contrastText };
