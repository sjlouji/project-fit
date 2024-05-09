import { ConstraintValidator } from '../algorithm/constraints';
import { Container, Item, Position3D, ItemDimensions, PlacedItem } from '../models';

describe('ConstraintValidator', () => {
  let container: Container;
  let item: Item;

  beforeEach(() => {
    container = {
      id: 'TEST-CONTAINER',
      length: 1000,
      width: 500,
      height: 500,
      maxWeight: 5000,
      unit: 'cm',
      weightUnit: 'kg'
    };

    item = {
      id: 'TEST-ITEM',
      type: 'carton',
      length: 100,
      width: 100,
      height: 100,
      weight: 50,
      quantity: 1,
      stackable: true,
      maxStackWeight: 500,
      fragile: false,
      loadBearing: true,
      rotationAllowed: ['xy', 'xz', 'yz'],
      priority: 1,
      deliveryStop: 1
    };
  });

  describe('validatePlacement', () => {
    it('should accept valid placement at origin', () => {
      const position: Position3D = { x: 0, y: 0, z: 0 };
      const dimensions: ItemDimensions = { length: 100, width: 100, height: 100 };

      const result = ConstraintValidator.validatePlacement(
        position,
        dimensions,
        container,
        item,
        [],
        0
      );

      expect(result.valid).toBe(true);
    });

    it('should reject placement exceeding container length', () => {
      const position: Position3D = { x: 950, y: 0, z: 0 };
      const dimensions: ItemDimensions = { length: 100, width: 100, height: 100 };

      const result = ConstraintValidator.validatePlacement(
        position,
        dimensions,
        container,
        item,
        [],
        0
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('bounds');
    });

    it('should reject placement exceeding weight limit', () => {
      const position: Position3D = { x: 0, y: 0, z: 0 };
      const dimensions: ItemDimensions = { length: 100, width: 100, height: 100 };
      const currentWeight = 4990;

      const result = ConstraintValidator.validatePlacement(
        position,
        dimensions,
        container,
        item,
        [],
        currentWeight
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('weight');
    });

    it('should reject overlapping placement', () => {
      const position: Position3D = { x: 50, y: 50, z: 0 };
      const dimensions: ItemDimensions = { length: 100, width: 100, height: 100 };

      const existingItem: PlacedItem = {
        itemId: 'EXISTING',
        instanceIndex: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { rx: 0, ry: 0, rz: 0 },
        dimensionsPlaced: { length: 100, width: 100, height: 100 },
        weight: 50
      };

      const result = ConstraintValidator.validatePlacement(
        position,
        dimensions,
        container,
        item,
        [existingItem],
        0
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('overlap');
    });

    it('should reject stacking on non-stackable item', () => {
      const nonStackableItem: Item = { ...item, id: 'NON-STACKABLE', stackable: false };
      const position: Position3D = { x: 0, y: 0, z: 100 };
      const dimensions: ItemDimensions = { length: 100, width: 100, height: 100 };

      const existingItem: PlacedItem = {
        itemId: 'NON-STACKABLE',
        instanceIndex: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { rx: 0, ry: 0, rz: 0 },
        dimensionsPlaced: { length: 100, width: 100, height: 100 },
        weight: 50
      };

      const itemsMap = new Map<string, Item>([['NON-STACKABLE', nonStackableItem]]);

      const result = ConstraintValidator.validatePlacement(
        position,
        dimensions,
        container,
        item,
        [existingItem],
        50,
        itemsMap
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('stack');
    });

    it('should allow valid stacking', () => {
      const stackableItem: Item = { ...item, id: 'STACKABLE' };
      const position: Position3D = { x: 0, y: 0, z: 100 };
      const dimensions: ItemDimensions = { length: 100, width: 100, height: 100 };

      const existingItem: PlacedItem = {
        itemId: 'STACKABLE',
        instanceIndex: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { rx: 0, ry: 0, rz: 0 },
        dimensionsPlaced: { length: 100, width: 100, height: 100 },
        weight: 50
      };

      const itemsMap = new Map<string, Item>([['STACKABLE', stackableItem]]);

      const result = ConstraintValidator.validatePlacement(
        position,
        dimensions,
        container,
        item,
        [existingItem],
        50,
        itemsMap
      );

      expect(result.valid).toBe(true);
    });
  });
});
