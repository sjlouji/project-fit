import { Container, Item, PackingResult, PlacedItem, getContainerVolume } from '../models';
import { ExtremePointPacker } from './extremePoint';

export class BinPacker {
  private container: Container;
  private items: Item[];

  constructor(container: Container, items: Item[]) {
    this.container = container;
    this.items = items;
  }

  pack(): PackingResult {
    const startTime = Date.now();

    const packer = new ExtremePointPacker(this.container, this.items);
    const { placed, unplaced } = packer.pack();

    const computationTimeMs = Date.now() - startTime;

    const containerVolume = getContainerVolume(this.container);
    const packedVolume = this.calculatePackedVolume(placed);
    const volumeEfficiency = (packedVolume / containerVolume) * 100;

    const totalWeight = packer.getCurrentWeight();
    const weightEfficiency = (totalWeight / this.container.maxWeight) * 100;

    const itemsPacked = placed.length;
    const itemsUnpacked = unplaced.reduce((sum, u) => sum + u.quantity, 0);

    const unpackedItemsStr = unplaced.map(u => `${u.itemId} (${u.quantity} units)`);

    const warnings = this.generateWarnings(placed, this.container, totalWeight);
    const centerOfGravity = packer.getCenterOfGravity();

    return {
      containerId: this.container.id,
      utilizationPct: volumeEfficiency,
      totalWeight,
      itemsPacked,
      itemsUnpacked,
      unpackedItems: unpackedItemsStr,
      packedItems: placed,
      centerOfGravity,
      warnings,
      metrics: {
        volumeEfficiency,
        weightEfficiency,
        computationTime: computationTimeMs
      },
      computationTimeMs
    };
  }

  private calculatePackedVolume(placedItems: PlacedItem[]): number {
    return placedItems.reduce((total, item) => {
      const vol = item.dimensionsPlaced.length * item.dimensionsPlaced.width * item.dimensionsPlaced.height;
      return total + vol;
    }, 0);
  }

  private generateWarnings(placed: PlacedItem[], container: Container, totalWeight: number): string[] {
    const warnings: string[] = [];

    if (totalWeight > container.maxWeight * 0.95) {
      warnings.push(`High weight utilization: ${(totalWeight / container.maxWeight * 100).toFixed(1)}%`);
    }

    const cog = this.calculateCenterOfGravity(placed);
    const containerCenter = {
      x: container.length / 2,
      y: container.width / 2,
      z: container.height / 2
    };

    const distFromCenter = Math.sqrt(
      Math.pow(cog.x - containerCenter.x, 2) +
      Math.pow(cog.y - containerCenter.y, 2)
    );

    const maxDeviation = Math.sqrt(
      Math.pow(container.length / 2, 2) +
      Math.pow(container.width / 2, 2)
    );

    if (distFromCenter / maxDeviation > 0.1) {
      warnings.push(`Center of gravity is off-center (deviation: ${(distFromCenter / maxDeviation * 100).toFixed(1)}%)`);
    }

    return warnings;
  }

  private calculateCenterOfGravity(placedItems: PlacedItem[]) {
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;
    let weightedZ = 0;

    for (const item of placedItems) {
      const centerX = item.position.x + item.dimensionsPlaced.length / 2;
      const centerY = item.position.y + item.dimensionsPlaced.width / 2;
      const centerZ = item.position.z + item.dimensionsPlaced.height / 2;

      weightedX += centerX * item.weight;
      weightedY += centerY * item.weight;
      weightedZ += centerZ * item.weight;
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
}
