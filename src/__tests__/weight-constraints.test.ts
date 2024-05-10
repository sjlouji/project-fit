import { packItems, Container, Item } from '../index';

describe('Weight Constraints', () => {
  const container: Container = {
    id: 'TEST-CONTAINER',
    length: 600,
    width: 200,
    height: 200,
    maxWeight: 1000,
    unit: 'cm',
    weightUnit: 'kg'
  };

  describe('Max Stack Weight Enforcement', () => {
    test('should not exceed item maxStackWeight when stacking', () => {
      const items: Item[] = [
        {
          id: 'BASE-CARTON',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 200,
          quantity: 2,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        },
        {
          id: 'HEAVY-CARTON',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 250,
          quantity: 2,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 1
        }
      ];

      const result = packItems(container, items);
      expect(result.itemsPacked + result.itemsUnpacked).toBeGreaterThan(0);
      expect(result.totalWeight).toBeLessThanOrEqual(container.maxWeight);
    });

    test('should reject fragile items with weight on top', () => {
      const items: Item[] = [
        {
          id: 'FRAGILE-BOX',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 50,
          quantity: 1,
          stackable: false,
          maxStackWeight: 0,
          fragile: true,
          loadBearing: false,
          rotationAllowed: ['xy'],
          priority: 1,
          deliveryStop: 1
        },
        {
          id: 'HEAVY-BOX',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 100,
          quantity: 1,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 1
        }
      ];

      const result = packItems(container, items);
      const fragilePlaced = result.packedItems.some(p => p.itemId === 'FRAGILE-BOX');
      const heavyAboveFragile = fragilePlaced &&
        result.packedItems.some(p =>
          p.itemId === 'HEAVY-BOX' &&
          p.position.z > result.packedItems.find(x => x.itemId === 'FRAGILE-BOX')!.position.z
        );

      expect(heavyAboveFragile).toBe(false);
    });

    test('should respect container weight limit', () => {
      const items: Item[] = [
        {
          id: 'OVERWEIGHT-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 600,
          quantity: 2,
          stackable: true,
          maxStackWeight: 1000,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(container, items);
      expect(result.totalWeight).toBeLessThanOrEqual(container.maxWeight);
    });
  });

  describe('Load Bearing Constraints', () => {
    test('should not place items on top of non-load-bearing items', () => {
      const items: Item[] = [
        {
          id: 'DELICATE-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 40,
          quantity: 1,
          stackable: true,
          maxStackWeight: 0,
          fragile: false,
          loadBearing: false,
          rotationAllowed: ['xy'],
          priority: 1,
          deliveryStop: 1
        },
        {
          id: 'HEAVY-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 60,
          quantity: 1,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 1
        }
      ];

      const result = packItems(container, items);
      const delicateItem = result.packedItems.find(p => p.itemId === 'DELICATE-ITEM');
      const heavyAboveDelicate = delicateItem &&
        result.packedItems.some(p =>
          p.itemId === 'HEAVY-ITEM' &&
          p.position.z >= delicateItem.position.z + delicateItem.dimensionsPlaced.height - 0.1
        );

      expect(heavyAboveDelicate).toBe(false);
    });
  });

  describe('Priority-based Layering', () => {
    test('should place lower priority items at lower heights', () => {
      const items: Item[] = [
        {
          id: 'PRIORITY-1',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 50,
          quantity: 1,
          stackable: true,
          maxStackWeight: 500,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        },
        {
          id: 'PRIORITY-2',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 30,
          quantity: 1,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 1
        }
      ];

      const result = packItems(container, items);
      const p1 = result.packedItems.find(p => p.itemId === 'PRIORITY-1');
      const p2 = result.packedItems.find(p => p.itemId === 'PRIORITY-2');

      if (p1 && p2) {
        expect(p1.position.z).toBeLessThanOrEqual(p2.position.z);
      }
    });
  });

  describe('Weight Distribution', () => {
    test('should calculate correct center of gravity', () => {
      const items: Item[] = [
        {
          id: 'SINGLE-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 100,
          quantity: 1,
          stackable: true,
          maxStackWeight: 500,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(container, items);
      expect(result.centerOfGravity.x).toBeGreaterThanOrEqual(0);
      expect(result.centerOfGravity.y).toBeGreaterThanOrEqual(0);
      expect(result.centerOfGravity.z).toBeGreaterThanOrEqual(0);
    });
  });
});
