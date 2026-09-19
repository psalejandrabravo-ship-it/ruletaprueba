export function abbreviateName(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "";
  const words = cleaned.split(/\s+/);
  const first = (words[0] ?? cleaned).replace(/[^\p{L}\p{N}]/gu, "");
  const slice = first.slice(0, 4);
  return slice.toUpperCase();
}

export function wrapLabel(name: string, maxChars = 13): string[] {
  const cleaned = name.trim();
  if (cleaned.length <= maxChars) return [cleaned];
  const words = cleaned.split(/\s+/);
  if (words.length === 1) return [cleaned];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

export function shouldAbbreviateLabels(segmentCount: number, wheelSizePx: number): boolean {
  if (segmentCount > 6) return true;
  if (wheelSizePx < 340) return true;
  return false;
}
