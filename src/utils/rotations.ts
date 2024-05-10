import { ItemDimensions, RotationAxis } from '../models/Item';

export type OrientationKey = string;

export function generateOrientations(
  length: number,
  width: number,
  height: number,
  allowedRotations: RotationAxis[]
): Array<{ dimensions: ItemDimensions; orientation: string }> {
  const orientations: Array<{ dimensions: ItemDimensions; orientation: string }> = [];
  const uniqueDims = new Set<string>();

  addUniqueOrientation(uniqueDims, orientations, length, width, height, 'L×W×H');

  const possibleOrientations = [
    [length, width, height, 'L×W×H'],
    [length, height, width, 'L×H×W'],
    [width, length, height, 'W×L×H'],
    [width, height, length, 'W×H×L'],
    [height, length, width, 'H×L×W'],
    [height, width, length, 'H×W×L']
  ];

  for (const [l, w, h, label] of possibleOrientations) {
    if (isOrientationAllowed(length, width, height, l as number, w as number, h as number, allowedRotations)) {
      addUniqueOrientation(uniqueDims, orientations, l as number, w as number, h as number, label as string);
    }
  }

  return orientations;
}

function isOrientationAllowed(
  origL: number,
  origW: number,
  origH: number,
  newL: number,
  newW: number,
  newH: number,
  allowedRotations: RotationAxis[]
): boolean {
  if (allowedRotations.length === 0) return true;

  if (origL === newL && origW === newW && origH === newH) {
    return true;
  }

  const dimSet1 = new Set([origL, origW, origH]);
  const dimSet2 = new Set([newL, newW, newH]);

  if (dimSet1.size !== dimSet2.size) return false;
  for (const d of dimSet1) {
    if (!dimSet2.has(d)) return false;
  }

  return true;
}

function addUniqueOrientation(
  uniqueDims: Set<string>,
  orientations: Array<{ dimensions: ItemDimensions; orientation: string }>,
  l: number,
  w: number,
  h: number,
  label: string
): void {
  const key = [l, w, h].sort().join(',');
  if (!uniqueDims.has(key)) {
    uniqueDims.add(key);
    orientations.push({
      dimensions: { length: l, width: w, height: h },
      orientation: label
    });
  }
}
