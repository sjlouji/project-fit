import { Position3D, ItemDimensions } from '../models/Item';

export interface BoundingBox {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

/**
 * Create bounding box for an item at a given position
 */
export function createBoundingBox(
  position: Position3D,
  dimensions: ItemDimensions
): BoundingBox {
  return {
    minX: position.x,
    minY: position.y,
    minZ: position.z,
    maxX: position.x + dimensions.length,
    maxY: position.y + dimensions.width,
    maxZ: position.z + dimensions.height
  };
}

/**
 * Check if two bounding boxes overlap in 3D space
 */
export function boundingBoxesOverlap(box1: BoundingBox, box2: BoundingBox): boolean {
  return !(
    box1.maxX <= box2.minX ||
    box1.minX >= box2.maxX ||
    box1.maxY <= box2.minY ||
    box1.minY >= box2.maxY ||
    box1.maxZ <= box2.minZ ||
    box1.minZ >= box2.maxZ
  );
}

/**
 * Check if a bounding box is completely within container bounds
 */
export function isWithinContainerBounds(
  bbox: BoundingBox,
  containerLength: number,
  containerWidth: number,
  containerHeight: number
): boolean {
  return (
    bbox.minX >= 0 &&
    bbox.minY >= 0 &&
    bbox.minZ >= 0 &&
    bbox.maxX <= containerLength &&
    bbox.maxY <= containerWidth &&
    bbox.maxZ <= containerHeight
  );
}

/**
 * Calculate contact surface area between two boxes
 * Returns the area where the boxes would touch
 */
export function getContactSurfaceArea(box1: BoundingBox, box2: BoundingBox): number {
  // Check if boxes are adjacent or touching
  // Top of box1 touching bottom of box2
  if (Math.abs(box1.maxZ - box2.minZ) < 0.01) {
    const overlapX = Math.min(box1.maxX, box2.maxX) - Math.max(box1.minX, box2.minX);
    const overlapY = Math.min(box1.maxY, box2.maxY) - Math.max(box1.minY, box2.minY);
    if (overlapX > 0 && overlapY > 0) {
      return overlapX * overlapY;
    }
  }
  return 0;
}

/**
 * Calculate center of gravity for a set of positioned items
 */
export function calculateCenterOfGravity(
  items: Array<{ position: Position3D; dimensions: ItemDimensions; weight: number }>
): Position3D {
  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;
  let weightedZ = 0;

  for (const item of items) {
    const itemCenterX = item.position.x + item.dimensions.length / 2;
    const itemCenterY = item.position.y + item.dimensions.width / 2;
    const itemCenterZ = item.position.z + item.dimensions.height / 2;

    weightedX += itemCenterX * item.weight;
    weightedY += itemCenterY * item.weight;
    weightedZ += itemCenterZ * item.weight;
    totalWeight += item.weight;
  }

  if (totalWeight === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight,
    z: weightedZ / totalWeight
  };
}
