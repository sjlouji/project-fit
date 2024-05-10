import { Container, Item, Position3D, PlacedItem, ItemDimensions } from '../models';
import { generateOrientations } from '../utils/rotations';
import { ConstraintValidator } from './constraints';
import { calculateCenterOfGravity } from '../utils/geometry';

export interface ExtremPoint {
  x: number;
  y: number;
  z: number;
}

export class ExtremePointPacker {
  private container: Container;
  private placedItems: PlacedItem[] = [];
  private extremePoints: ExtremPoint[] = [];
  private currentWeight: number = 0;
  private itemsMap: Map<string, Item>;
  private startTime: number = 0;

  constructor(container: Container, items: Item[]) {
    this.container = container;
    this.itemsMap = new Map(items.map(item => [item.id, item]));
    this.extremePoints = [{ x: 0, y: 0, z: 0 }];
  }

  pack(): { placed: PlacedItem[]; unplaced: Array<{ itemId: string; quantity: number }> } {
    this.startTime = Date.now();

    const sortedItems = this.sortItems();
    const unplaced: Array<{ itemId: string; quantity: number }> = [];

    for (const item of sortedItems) {
      let itemsToPlace = item.quantity;

      for (let instance = 0; instance < item.quantity; instance++) {
        const placement = this.findBestPlacement(item);

        if (placement) {
          this.placedItems.push(placement);
          this.currentWeight += item.weight;
          this.updateExtremePoints(placement);
        } else {
          itemsToPlace--;
          if (itemsToPlace > 0 && instance === item.quantity - 1) {
            unplaced.push({ itemId: item.id, quantity: itemsToPlace });
          }
        }
      }

      if (itemsToPlace < item.quantity) {
        unplaced.push({ itemId: item.id, quantity: item.quantity - itemsToPlace });
      }
    }

    return { placed: this.placedItems, unplaced };
  }

  private findBestPlacement(item: Item): PlacedItem | null {
    let bestPlacement: PlacedItem | null = null;
    let bestScore = Infinity;

    const orientations = generateOrientations(
      item.length,
      item.width,
      item.height,
      item.rotationAllowed
    );

    for (const extPoint of this.extremePoints) {
      for (const { dimensions } of orientations) {
        const position: Position3D = { x: extPoint.x, y: extPoint.y, z: extPoint.z };

        const validation = ConstraintValidator.validatePlacement(
          position,
          dimensions,
          this.container,
          item,
          this.placedItems,
          this.currentWeight,
          this.itemsMap
        );

        if (validation.valid) {
          const score = this.calculatePlacementScore(position, dimensions);

          if (score < bestScore) {
            bestScore = score;
            bestPlacement = {
              itemId: item.id,
              instanceIndex: this.placedItems.filter(p => p.itemId === item.id).length,
              position,
              rotation: { rx: 0, ry: 0, rz: 0 },
              dimensionsPlaced: dimensions,
              weight: item.weight
            };
          }
        }
      }
    }

    return bestPlacement;
  }

  private calculatePlacementScore(position: Position3D, dimensions: ItemDimensions): number {
    const zScore = position.z * 1000;
    const xScore = position.x * 10;
    const yScore = position.y;

    return zScore + xScore + yScore;
  }

  private updateExtremePoints(placed: PlacedItem): void {
    const newPoints: ExtremPoint[] = [];

    for (const point of this.extremePoints) {
      const isInside =
        point.x < placed.position.x + placed.dimensionsPlaced.length &&
        point.x >= placed.position.x &&
        point.y < placed.position.y + placed.dimensionsPlaced.width &&
        point.y >= placed.position.y &&
        point.z < placed.position.z + placed.dimensionsPlaced.height &&
        point.z >= placed.position.z;

      if (!isInside) {
        newPoints.push(point);
      }
    }

    this.extremePoints = newPoints;

    const newExtremePoints = [
      { x: placed.position.x + placed.dimensionsPlaced.length, y: placed.position.y, z: placed.position.z },
      { x: placed.position.x, y: placed.position.y + placed.dimensionsPlaced.width, z: placed.position.z },
      { x: placed.position.x, y: placed.position.y, z: placed.position.z + placed.dimensionsPlaced.height }
    ];

    for (const newPoint of newExtremePoints) {
      const isDuplicate = this.extremePoints.some(
        p => p.x === newPoint.x && p.y === newPoint.y && p.z === newPoint.z
      );

      if (!isDuplicate) {
        this.extremePoints.push(newPoint);
      }
    }
  }

  private sortItems(): Item[] {
    const items = Array.from(this.itemsMap.values());

    return items.sort((a, b) => {
      const volumeA = a.length * a.width * a.height;
      const volumeB = b.length * b.width * b.height;

      if (volumeA !== volumeB) {
        return volumeB - volumeA;
      }

      return a.priority - b.priority;
    });
  }

  getExtremePoints(): ExtremPoint[] {
    return this.extremePoints;
  }

  getPlacedItems(): PlacedItem[] {
    return this.placedItems;
  }

  getComputationTimeMs(): number {
    return Date.now() - this.startTime;
  }

  getCurrentWeight(): number {
    return this.currentWeight;
  }

  getCenterOfGravity(): Position3D {
    return calculateCenterOfGravity(
      this.placedItems.map(p => ({
        position: p.position,
        dimensions: p.dimensionsPlaced,
        weight: p.weight
      }))
    );
  }
}
