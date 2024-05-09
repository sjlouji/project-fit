export interface Container {
  id: string;
  length: number;
  width: number;
  height: number;
  maxWeight: number;
  unit: string;
  weightUnit: string;
}

export interface ContainerDimensions {
  length: number;
  width: number;
  height: number;
}

export function getContainerVolume(container: Container): number {
  return container.length * container.width * container.height;
}
