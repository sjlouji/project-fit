export * from './models';
export * from './algorithm';
export * from './utils/geometry';
export * from './utils/rotations';

import { BinPacker } from './algorithm';
import { Container, Item, PackingResult } from './models';

/**
 * Pack items into a container using the Extreme Point heuristic algorithm
 */
export function packItems(container: Container, items: Item[]): PackingResult {
  const packer = new BinPacker(container, items);
  return packer.pack();
}
