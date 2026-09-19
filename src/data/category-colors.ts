export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
}

export const CATEGORY_COLORS: PaletteColor[] = [
  { id: "indigo", name: "Índigo profundo", hex: "#2B2155" },
  { id: "coral", name: "Coral cálido", hex: "#E07A5F" },
  { id: "gold", name: "Amarillo dorado", hex: "#E6B84C" },
  { id: "teal", name: "Turquesa", hex: "#2F7D73" },
  { id: "violet", name: "Violeta suave", hex: "#5C4E86" },
  { id: "slate", name: "Azul pizarra", hex: "#3A4F73" },
  { id: "terra", name: "Terracota", hex: "#C45C3E" },
  { id: "olive", name: "Oliva", hex: "#5F7040" },
  { id: "rose", name: "Rosa terroso", hex: "#A85B63" },
  { id: "sea", name: "Verde mar", hex: "#1F5C64" },
];

export const FALLBACK_CATEGORY_COLOR = "#2B2155";

export function findColorName(hex: string): string {
  const match = CATEGORY_COLORS.find(
    (color) => color.hex.toLowerCase() === hex.toLowerCase(),
  );
  return match?.name ?? "Color personalizado";
}

export function nextUnusedColor(usedHexes: string[]): string {
  const used = new Set(usedHexes.map((hex) => hex.toLowerCase()));
  const unused = CATEGORY_COLORS.find((color) => !used.has(color.hex.toLowerCase()));
  return unused?.hex ?? CATEGORY_COLORS[0].hex;
}
