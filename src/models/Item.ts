export type ItemType = 'carton' | 'pallet' | 'crate' | 'drum' | 'custom';
export type RotationAxis = 'xy' | 'xz' | 'yz';

export interface Item {
  id: string;
  type: ItemType;
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
  stackable: boolean;
  maxStackWeight: number;
  fragile: boolean;
  loadBearing: boolean;
  rotationAllowed: RotationAxis[];
  priority: number;
  deliveryStop: number;
}

export interface ItemDimensions {
  length: number;
  width: number;
  height: number;
}

export interface PlacedItem {
  itemId: string;
  instanceIndex: number;
  position: Position3D;
  rotation: Rotation;
  dimensionsPlaced: ItemDimensions;
  weight: number;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  rx: number;
  ry: number;
  rz: number;
}

export function getItemVolume(item: Item): number {
  return item.length * item.width * item.height;
}

export function getItemTotalWeight(item: Item): number {
  return item.weight * item.quantity;
}
