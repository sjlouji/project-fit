import { Container, Item, ItemDimensions, Position3D, PlacedItem } from '../models';
import { BoundingBox, boundingBoxesOverlap, isWithinContainerBounds, createBoundingBox } from '../utils/geometry';

export interface DeliveryOrderViolation {
  stop1: number;
  stop2: number;
  stop1AvgZ: number;
  stop2AvgZ: number;
  message: string;
}

export interface DeliveryOrderResult {
  valid: boolean;
  violations: DeliveryOrderViolation[];
  summary?: string;
}

export class ConstraintValidator {
  static validatePlacement(
    position: Position3D,
    dimensions: ItemDimensions,
    container: Container,
    item: Item,
    placedItems: PlacedItem[],
    currentTotalWeight: number,
    itemsMap?: Map<string, Item>
  ): { valid: boolean; error?: string } {
    const bbox = createBoundingBox(position, dimensions);
    if (!isWithinContainerBounds(bbox, container.length, container.width, container.height)) {
      return { valid: false, error: 'Item exceeds container bounds' };
    }

    for (const placed of placedItems) {
      const placedBbox = createBoundingBox(placed.position, placed.dimensionsPlaced);
      if (boundingBoxesOverlap(bbox, placedBbox)) {
        return { valid: false, error: 'Item overlaps with existing placement' };
      }
    }

    const newTotalWeight = currentTotalWeight + item.weight;
    if (newTotalWeight > container.maxWeight) {
      return { valid: false, error: 'Exceeds container weight limit' };
    }

    if (itemsMap) {
      const itemBelow = this.findItemBelow(position, dimensions, placedItems, itemsMap);
      if (itemBelow) {
        if (!itemBelow.item.stackable) {
          return { valid: false, error: 'Cannot stack on non-stackable item' };
        }

        const weightOnTop = this.calculateWeightAbove(position, dimensions, placedItems);
        if (weightOnTop + item.weight > itemBelow.item.maxStackWeight) {
          return { valid: false, error: 'Exceeds max stack weight' };
        }
      }
    }

    if (item.fragile) {
      const weightAbove = this.calculateWeightAbove(position, dimensions, placedItems);
      if (weightAbove > 0) {
        return { valid: false, error: 'Cannot place weight on top of fragile items' };
      }
    }

    if (!item.loadBearing && itemsMap) {
      const weightAbove = this.calculateWeightAbove(position, dimensions, placedItems);
      if (weightAbove > 0) {
        return { valid: false, error: 'This item type cannot support weight on top' };
      }
    }

    if (itemsMap) {
      const cogCheck = this.validateCenterOfGravity(position, dimensions, placedItems, item, container);
      if (!cogCheck.valid) {
        return { valid: false, error: cogCheck.error };
      }
    }

    return { valid: true };
  }

  /**
   * Find the item directly below the given position
   */
  private static findItemBelow(
    position: Position3D,
    dimensions: ItemDimensions,
    placedItems: PlacedItem[],
    itemsMap: Map<string, Item>
  ): { placed: PlacedItem; item: Item } | null {
    const currentBbox = createBoundingBox(position, dimensions);

    let below: { placed: PlacedItem; item: Item } | null = null;
    let maxZ = -1;

    for (const placed of placedItems) {
      const placedBbox = createBoundingBox(placed.position, placed.dimensionsPlaced);

      if (Math.abs(placedBbox.maxZ - currentBbox.minZ) < 0.01) {
        const xOverlap = Math.min(currentBbox.maxX, placedBbox.maxX) - Math.max(currentBbox.minX, placedBbox.minX);
        const yOverlap = Math.min(currentBbox.maxY, placedBbox.maxY) - Math.max(currentBbox.minY, placedBbox.minY);

        if (xOverlap > 0 && yOverlap > 0) {
          if (placedBbox.maxZ > maxZ) {
            maxZ = placedBbox.maxZ;
            const item = itemsMap.get(placed.itemId);
            if (item) {
              below = { placed, item };
            }
          }
        }
      }
    }

    return below;
  }

  /**
   * Calculate total weight of items above the given position/dimensions
   */
  private static calculateWeightAbove(
    position: Position3D,
    dimensions: ItemDimensions,
    placedItems: PlacedItem[]
  ): number {
    const currentBbox = createBoundingBox(position, dimensions);
    let totalWeight = 0;

    for (const placed of placedItems) {
      const placedBbox = createBoundingBox(placed.position, placed.dimensionsPlaced);

      if (placedBbox.minZ >= currentBbox.maxZ - 0.01) {
        const xOverlap = Math.min(currentBbox.maxX, placedBbox.maxX) - Math.max(currentBbox.minX, placedBbox.minX);
        const yOverlap = Math.min(currentBbox.maxY, placedBbox.maxY) - Math.max(currentBbox.minY, placedBbox.minY);

        if (xOverlap > 0.01 && yOverlap > 0.01) {
          totalWeight += placed.weight;
        }
      }
    }

    return totalWeight;
  }

  /**
   * Validate center of gravity for stability
   * Prevents excessive top-heavy loading that could tip the truck
   */
  private static validateCenterOfGravity(
    position: Position3D,
    dimensions: ItemDimensions,
    _placedItems: PlacedItem[],
    _item: Item,
    container: Container
  ): { valid: boolean; error?: string } {
    if (position.z > 150) {
      const containerCenterX = container.length / 2;
      const containerCenterY = container.width / 2;
      const itemCenterX = position.x + dimensions.length / 2;
      const itemCenterY = position.y + dimensions.width / 2;

      const horizontalDistance = Math.sqrt(
        Math.pow(itemCenterX - containerCenterX, 2) + Math.pow(itemCenterY - containerCenterY, 2)
      );

      if (horizontalDistance > 300) {
        return {
          valid: false,
          error: `High-stacked items must be closer to container center (distance: ${horizontalDistance.toFixed(0)}cm > 300cm limit)`
        };
      }
    }

    return { valid: true };
  }

  static validateDeliveryOrderSequence(
    placedItems: PlacedItem[],
    itemsMap: Map<string, Item>
  ): DeliveryOrderResult {
    const violations: DeliveryOrderViolation[] = [];

    if (placedItems.length === 0) {
      return { valid: true, violations: [] };
    }

    const deliveryStops = new Map<number, PlacedItem[]>();

    for (const placed of placedItems) {
      const item = itemsMap.get(placed.itemId);
      if (!item) continue;

      if (!deliveryStops.has(item.deliveryStop)) {
        deliveryStops.set(item.deliveryStop, []);
      }
      deliveryStops.get(item.deliveryStop)!.push(placed);
    }

    if (deliveryStops.size <= 1) {
      return { valid: true, violations: [] };
    }

    const stops = Array.from(deliveryStops.keys()).sort((a, b) => a - b);

    for (let i = 0; i < stops.length - 1; i++) {
      const stop1 = stops[i];
      const stop2 = stops[i + 1];

      const items1 = deliveryStops.get(stop1)!;
      const items2 = deliveryStops.get(stop2)!;

      const avgZ1 = items1.reduce((sum, p) => sum + p.position.z, 0) / items1.length;
      const avgZ2 = items2.reduce((sum, p) => sum + p.position.z, 0) / items2.length;

      if (avgZ1 < avgZ2) {
        violations.push({
          stop1,
          stop2,
          stop1AvgZ: avgZ1,
          stop2AvgZ: avgZ2,
          message: `Stop ${stop1} (avg Z: ${avgZ1.toFixed(0)}cm) should be unloaded before Stop ${stop2} (avg Z: ${avgZ2.toFixed(0)}cm). For LIFO unloading, Stop ${stop1} must be above Stop ${stop2}.`
        });
      }
    }

    let summary = '';
    if (violations.length === 0) {
      summary = 'Delivery order is LIFO compliant - all stops can be unloaded in sequence without moving other cargo.';
    } else {
      summary = `${violations.length} delivery order violation(s) detected. Items blocking earlier stops must be repositioned.`;
    }

    return {
      valid: violations.length === 0,
      violations,
      summary
    };
  }
}
