/**
 * The wheel is drawn with segment 0 starting at the top (12 o'clock) and
 * continuing clockwise. The pointer is fixed at the top.
 *
 * CSS `rotate()` turns the disk clockwise for positive degrees. To place the
 * center of segment `index` under the pointer, the disk must rotate by
 * `-(index * slice + slice / 2)` modulo 360.
 */
export function segmentCenterFromTop(index: number, count: number): number {
  const slice = 360 / count;
  return index * slice + slice / 2;
}

export function targetRotationModulo(index: number, count: number): number {
  const center = segmentCenterFromTop(index, count);
  return (360 - (center % 360)) % 360;
}

export function computeNextRotation(
  currentRotation: number,
  index: number,
  count: number,
  extraSpins: number,
): number {
  if (count <= 0) return currentRotation;
  const targetMod = targetRotationModulo(index, count);
  const currentMod = ((currentRotation % 360) + 360) % 360;
  let delta = targetMod - currentMod;
  if (delta < 0.5) delta += 360;
  return currentRotation + extraSpins * 360 + delta;
}

export function initialRotation(count: number): number {
  if (count <= 0) return 0;
  return targetRotationModulo(0, count);
}

export function winningIndexFromRotation(rotation: number, count: number): number {
  if (count <= 0) return 0;
  const slice = 360 / count;
  const normalized = ((rotation % 360) + 360) % 360;
  const fromTop = (360 - normalized) % 360;
  return Math.floor(fromTop / slice) % count;
}
