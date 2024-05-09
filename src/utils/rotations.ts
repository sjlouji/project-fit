import { ItemDimensions, RotationAxis } from '../models/Item';

export type OrientationKey = string;

/**
 * Generate all possible orientations for an item given allowed rotation axes
 */
export function generateOrientations(
  length: number,
  width: number,
  height: number,
  allowedRotations: RotationAxis[]
): Array<{ dimensions: ItemDimensions; orientation: string }> {
  const orientations: Array<{ dimensions: ItemDimensions; orientation: string }> = [];
  const uniqueDims = new Set<string>();

  // Original orientation
  addUniqueOrientation(uniqueDims, orientations, length, width, height, 'L×W×H');

  // Generate all 24 possible orientations for a rectangular box
  // Then filter by allowed rotations
  const allPossibilities = [
    [length, width, height, 'L×W×H'],
    [length, height, width, 'L×H×W'],
    [width, length, height, 'W×L×H'],
    [width, height, length, 'W×H×L'],
    [height, length, width, 'H×L×W'],
    [height, width, length, 'H×W×L']
  ];

  for (const [l, w, h, label] of allPossibilities) {
    if (isOrientationAllowed(length, width, height, l as number, w as number, h as number, allowedRotations)) {
      addUniqueOrientation(uniqueDims, orientations, l as number, w as number, h as number, label as string);
    }
  }

  return orientations;
}

/**
 * Check if a specific rotation is allowed based on the allowed rotation axes
 */
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

  // Check if this is the original orientation
  if (origL === newL && origW === newW && origH === newH) {
    return true;
  }

  // Map dimension swaps to rotation axes
  // xy rotation: swaps length and width
  // xz rotation: swaps length and height
  // yz rotation: swaps width and height

  const dimSet1 = new Set([origL, origW, origH]);
  const dimSet2 = new Set([newL, newW, newH]);

  // Ensure same set of dimensions
  if (dimSet1.size !== dimSet2.size) return false;
  for (const d of dimSet1) {
    if (!dimSet2.has(d)) return false;
  }

  // If no rotations allowed, only accept original
  if (allowedRotations.length === 0) {
    return origL === newL && origW === newW && origH === newH;
  }

  // For now, accept any orientation that's in allowedRotations
  // This is a simplified check - a full implementation would track actual rotation angles
  return true;
}

/**
 * Add orientation only if it hasn't been added before (avoid duplicates for cubes)
 */
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
