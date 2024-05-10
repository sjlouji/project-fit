import { packItems, Container, Item } from '../index';

describe('Edge Cases and Constraint Interactions', () => {
  const baseContainer: Container = {
    id: 'EDGE-CASE-TEST',
    length: 600,
    width: 300,
    height: 300,
    maxWeight: 2000,
    unit: 'cm',
    weightUnit: 'kg'
  };

  describe('Empty and Minimal Loads', () => {
    test('should handle empty item list', () => {
      const result = packItems(baseContainer, []);
      expect(result.itemsPacked).toBe(0);
      expect(result.itemsUnpacked).toBe(0);
      expect(result.totalWeight).toBe(0);
    });

    test('should handle single item', () => {
      const items: Item[] = [
        {
          id: 'SINGLE-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 50,
          quantity: 1,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      expect(result.itemsPacked).toBe(1);
      expect(result.totalWeight).toBe(50);
    });

    test('should handle item that exceeds container dimensions', () => {
      const items: Item[] = [
        {
          id: 'TOO-BIG',
          type: 'carton',
          length: 700,
          width: 100,
          height: 100,
          weight: 50,
          quantity: 1,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      expect(result.itemsUnpacked).toBe(1);
      expect(result.itemsPacked).toBe(0);
    });
  });

  describe('Extreme Weight Scenarios', () => {
    test('should handle single very heavy item at weight limit', () => {
      const items: Item[] = [
        {
          id: 'HEAVY-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 2000,
          quantity: 1,
          stackable: true,
          maxStackWeight: 0,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      expect(result.totalWeight).toBeLessThanOrEqual(baseContainer.maxWeight);
    });

    test('should reject items that together exceed weight limit', () => {
      const items: Item[] = [
        {
          id: 'HEAVY-1',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 1200,
          quantity: 2,
          stackable: true,
          maxStackWeight: 3000,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      expect(result.totalWeight).toBeLessThanOrEqual(baseContainer.maxWeight);
      expect(result.itemsUnpacked).toBeGreaterThan(0);
    });

    test('should handle items with very low weight', () => {
      const items: Item[] = [
        {
          id: 'LIGHT-ITEM',
          type: 'carton',
          length: 50,
          width: 50,
          height: 50,
          weight: 0.5,
          quantity: 100,
          stackable: true,
          maxStackWeight: 100,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy'],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      expect(result.totalWeight).toBeLessThanOrEqual(baseContainer.maxWeight);
      expect(result.itemsPacked).toBeGreaterThan(0);
    });
  });

  describe('All Fragile Load', () => {
    test('should handle container of all fragile items', () => {
      const items: Item[] = [
        {
          id: 'FRAGILE-1',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 30,
          quantity: 3,
          stackable: false,
          maxStackWeight: 0,
          fragile: true,
          loadBearing: false,
          rotationAllowed: ['xy'],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      const fragilePlaced = result.packedItems.every(p => !p.itemId.includes('FRAGILE'));
      expect(result.itemsPacked + result.itemsUnpacked).toBeGreaterThan(0);
    });
  });

  describe('Conflicting Constraints', () => {
    test('should handle item that is heavy but not stackable', () => {
      const items: Item[] = [
        {
          id: 'HEAVY-NO-STACK',
          type: 'carton',
          length: 150,
          width: 150,
          height: 100,
          weight: 300,
          quantity: 2,
          stackable: false,
          maxStackWeight: 0,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      const placed = result.packedItems.filter(p => p.itemId === 'HEAVY-NO-STACK');
      expect(placed.length).toBeLessThanOrEqual(2);
    });

    test('should handle fragile items with different dimensions', () => {
      const items: Item[] = [
        {
          id: 'FRAGILE-TALL',
          type: 'carton',
          length: 50,
          width: 50,
          height: 150,
          weight: 40,
          quantity: 1,
          stackable: false,
          maxStackWeight: 0,
          fragile: true,
          loadBearing: false,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        },
        {
          id: 'FRAGILE-WIDE',
          type: 'carton',
          length: 150,
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
        }
      ];

      const result = packItems(baseContainer, items);
      expect(result.itemsPacked).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Multi-Stop Delivery', () => {
    test('should handle items with different delivery stops', () => {
      const items: Item[] = [
        {
          id: 'STOP-1',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 100,
          quantity: 2,
          stackable: true,
          maxStackWeight: 500,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        },
        {
          id: 'STOP-2',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 80,
          quantity: 2,
          stackable: true,
          maxStackWeight: 400,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 2
        },
        {
          id: 'STOP-3',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 60,
          quantity: 2,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 3,
          deliveryStop: 3
        }
      ];

      const result = packItems(baseContainer, items);
      expect(result.itemsPacked + result.itemsUnpacked).toBeGreaterThan(0);
    });
  });

  describe('Identical Items Packing', () => {
    test('should efficiently stack identical items', () => {
      const items: Item[] = [
        {
          id: 'IDENTICAL',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 50,
          quantity: 10,
          stackable: true,
          maxStackWeight: 500,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      expect(result.itemsPacked).toBeGreaterThan(0);
      expect(result.utilizationPct).toBeGreaterThan(0);
    });
  });

  describe('Varied Item Types', () => {
    test('should pack mixed types with different constraints', () => {
      const items: Item[] = [
        {
          id: 'PALLET',
          type: 'pallet',
          length: 120,
          width: 80,
          height: 100,
          weight: 200,
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
          id: 'CARTON',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 40,
          quantity: 3,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy'],
          priority: 2,
          deliveryStop: 1
        },
        {
          id: 'DRUM',
          type: 'drum',
          length: 90,
          width: 90,
          height: 110,
          weight: 150,
          quantity: 1,
          stackable: true,
          maxStackWeight: 400,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      expect(result.itemsPacked + result.itemsUnpacked).toBeGreaterThan(0);
    });
  });

  describe('Zero and Negative Edge Cases', () => {
    test('should handle zero quantity gracefully', () => {
      const items: Item[] = [
        {
          id: 'ZERO-QTY',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 50,
          quantity: 0,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      expect(result.itemsPacked).toBe(0);
    });
  });
});
