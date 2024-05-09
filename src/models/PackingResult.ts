import { PlacedItem, Position3D } from './Item';

export interface PackingResult {
  containerId: string;
  utilizationPct: number;
  totalWeight: number;
  itemsPacked: number;
  itemsUnpacked: number;
  unpackedItems: string[];
  packedItems: PlacedItem[];
  centerOfGravity: Position3D;
  warnings: string[];
  metrics: PackingMetrics;
  computationTimeMs: number;
}

export interface PackingMetrics {
  volumeEfficiency: number;
  weightEfficiency: number;
  computationTime: number;
}

export interface UnpackedItemInfo {
  itemId: string;
  quantity: number;
  reason: string;
}
