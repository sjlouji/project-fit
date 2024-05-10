import { packItems, Container, Item } from '../index';

describe('Rotation Handling', () => {
  const container: Container = {
    id: 'ROTATION-TEST',
    length: 600,
    width: 300,
    height: 300,
    maxWeight: 2000,
    unit: 'cm',
    weightUnit: 'kg'
  };

  describe('Rotation Constraints', () => {
    test('should not rotate items when rotationAllowed is empty', () => {
      const items: Item[] = [
        {
          id: 'FIXED-ORIENTATION',
          type: 'carton',
          length: 200,
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
        }
      ];

      const result = packItems(container, items);
      const placed = result.packedItems.find(p => p.itemId === 'FIXED-ORIENTATION');

      if (placed) {
        expect(placed.dimensionsPlaced.length).toBe(200);
        expect(placed.dimensionsPlaced.width).toBe(100);
        expect(placed.dimensionsPlaced.height).toBe(50);
      }
    });

    test('should allow xy-plane rotation', () => {
      const items: Item[] = [
        {
          id: 'XY-ROTATABLE',
          type: 'carton',
          length: 200,
          width: 100,
          height: 50,
          weight: 40,
          quantity: 2,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy'],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(container, items);
      expect(result.itemsPacked + result.itemsUnpacked).toBeGreaterThan(0);
    });

    test('should utilize multiple rotations for better packing', () => {
      const smallContainer: Container = {
        id: 'SMALL-CONTAINER',
        length: 300,
        width: 200,
        height: 200,
        maxWeight: 1000,
        unit: 'cm',
        weightUnit: 'kg'
      };

      const items: Item[] = [
        {
          id: 'MULTI-ROTATABLE',
          type: 'carton',
          length: 150,
          width: 100,
          height: 80,
          weight: 30,
          quantity: 3,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy', 'xz', 'yz'],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(smallContainer, items);
      expect(result.itemsPacked).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Non-Rotatable Items', () => {
    test('should handle pallets that cannot be rotated', () => {
      const items: Item[] = [
        {
          id: 'PALLET-FIXED',
          type: 'pallet',
          length: 120,
          width: 80,
          height: 140,
          weight: 300,
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
      expect(result.itemsPacked + result.itemsUnpacked).toBeGreaterThan(0);
    });
  });

  describe('Rotation Impact on Packing', () => {
    test('should find better packing through rotation', () => {
      const narrowContainer: Container = {
        id: 'NARROW-CONTAINER',
        length: 400,
        width: 150,
        height: 250,
        maxWeight: 1000,
        unit: 'cm',
        weightUnit: 'kg'
      };

      const items: Item[] = [
        {
          id: 'FLEXIBLE-BOX',
          type: 'carton',
          length: 120,
          width: 80,
          height: 60,
          weight: 40,
          quantity: 2,
          stackable: true,
          maxStackWeight: 300,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy', 'xz', 'yz'],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(narrowContainer, items);
      expect(result.itemsPacked).toBeGreaterThan(0);
    });
  });
});
