import { CATEGORY_COLORS, FALLBACK_CATEGORY_COLOR } from "@/data/category-colors";

const HEX6 = /^#([0-9a-fA-F]{6})$/;

export function isValidHexColor(value: string): boolean {
  return HEX6.test(value.trim());
}

export function sanitizeHexColor(value: unknown): string {
  if (typeof value !== "string") return FALLBACK_CATEGORY_COLOR;
  const trimmed = value.trim();
  if (HEX6.test(trimmed)) return trimmed.toUpperCase().replace(/^#/, "#");
  const named = CATEGORY_COLORS.find(
    (color) => color.name.toLowerCase() === trimmed.toLowerCase(),
  );
  return named?.hex ?? FALLBACK_CATEGORY_COLOR;
}

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const raw = hex.replace("#", "");
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  );
}

export function contrastText(hex: string): "#1E1830" | "#F7F1E6" {
  return relativeLuminance(hex) > 0.42 ? "#1E1830" : "#F7F1E6";
}

export function normalizeHex(hex: string): string {
  const sanitized = sanitizeHexColor(hex);
  return `#${sanitized.replace("#", "").toUpperCase()}`;
}
