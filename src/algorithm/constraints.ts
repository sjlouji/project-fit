import { Container, Item, ItemDimensions, Position3D, PlacedItem } from '../models';
import { BoundingBox, boundingBoxesOverlap, isWithinContainerBounds, createBoundingBox } from '../utils/geometry';

export class ConstraintValidator {
  /**
   * Check if an item placement is valid within all constraints
   */
  static validatePlacement(
    position: Position3D,
    dimensions: ItemDimensions,
    container: Container,
    item: Item,
    placedItems: PlacedItem[],
    currentTotalWeight: number,
    itemsMap?: Map<string, Item>
  ): { valid: boolean; error?: string } {
    // Check 1: Container bounds
    const bbox = createBoundingBox(position, dimensions);
    if (!isWithinContainerBounds(bbox, container.length, container.width, container.height)) {
      return { valid: false, error: 'Item exceeds container bounds' };
    }

    // Check 2: No overlap with existing items
    for (const placed of placedItems) {
      const placedBbox = createBoundingBox(placed.position, placed.dimensionsPlaced);
      if (boundingBoxesOverlap(bbox, placedBbox)) {
        return { valid: false, error: 'Item overlaps with existing placement' };
      }
    }

    // Check 3: Weight limit
    const newTotalWeight = currentTotalWeight + item.weight;
    if (newTotalWeight > container.maxWeight) {
      return { valid: false, error: 'Exceeds container weight limit' };
    }

    // Check 4: Stackability - if placing on top of another item
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

    // Check 5: Fragile items cannot have weight on top
    if (item.fragile) {
      // For now, fragile items must be on top layer
      // Could be enhanced with delivery order constraints
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

    // Find item with maxZ that equals our minZ and has overlapping X-Y
    let below: { placed: PlacedItem; item: Item } | null = null;
    let maxZ = -1;

    for (const placed of placedItems) {
      const placedBbox = createBoundingBox(placed.position, placed.dimensionsPlaced);

      // Check if this item's top is at our bottom
      if (Math.abs(placedBbox.maxZ - currentBbox.minZ) < 0.01) {
        // Check X-Y overlap
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

      // Item is above if its minZ is >= our maxZ
      if (placedBbox.minZ >= currentBbox.maxZ - 0.01) {
        // Check X-Y overlap
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
   * Check if a set of placements respects delivery stop ordering
   * Items for later stops should be loaded deeper (placed first)
   */
  static validateDeliveryOrderSequence(placedItems: PlacedItem[], itemsMap: Map<string, Item>): boolean {
    // Later delivery stops should have lower Z coordinates on average
    // This is a soft constraint - algorithm should try to respect it
    return true; // Placeholder for now
  }
}
