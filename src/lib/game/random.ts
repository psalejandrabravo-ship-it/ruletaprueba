export function randomInt(max: number): number {
  if (max <= 0) {
    throw new Error("randomInt requiere un máximo positivo.");
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("No hay elementos para elegir.");
  }
  return items[randomInt(items.length)] as T;
}
