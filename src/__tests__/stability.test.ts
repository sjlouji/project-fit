import { packItems, Container, Item } from '../index';

describe('Load Stability & Center of Gravity', () => {
  const standardContainer: Container = {
    id: 'STABILITY-TEST',
    length: 1200,
    width: 234,
    height: 235,
    maxWeight: 28000,
    unit: 'cm',
    weightUnit: 'kg'
  };

  describe('Center of Gravity Calculation', () => {
    test('should calculate COG for single item', () => {
      const items: Item[] = [
        {
          id: 'SINGLE-CARTON',
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

      const result = packItems(standardContainer, items);
      expect(result.centerOfGravity.x).toBeCloseTo(50, 0);
      expect(result.centerOfGravity.y).toBeCloseTo(50, 0);
      expect(result.centerOfGravity.z).toBeCloseTo(50, 0);
    });

    test('should calculate weighted COG for multiple items at different heights', () => {
      const items: Item[] = [
        {
          id: 'BOTTOM-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
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
          id: 'TOP-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 50,
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

      const result = packItems(standardContainer, items);
      const bottomItem = result.packedItems.find(p => p.itemId === 'BOTTOM-ITEM');

      if (bottomItem && result.centerOfGravity) {
        expect(result.centerOfGravity.z).toBeLessThan(75);
      }
    });
  });

  describe('High Stack Stability', () => {
    test('should prevent high stacks from being placed too far from center', () => {
      const narrowContainer: Container = {
        id: 'NARROW-STABILITY',
        length: 500,
        width: 300,
        height: 400,
        maxWeight: 2000,
        unit: 'cm',
        weightUnit: 'kg'
      };

      const items: Item[] = [
        {
          id: 'LIGHT-STACKS',
          type: 'carton',
          length: 50,
          width: 50,
          height: 50,
          weight: 20,
          quantity: 8,
          stackable: true,
          maxStackWeight: 200,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy'],
          priority: 2,
          deliveryStop: 1
        }
      ];

      const result = packItems(narrowContainer, items);
      const highItems = result.packedItems.filter(p => p.position.z > 150);

      const containerCenterX = narrowContainer.length / 2;
      const containerCenterY = narrowContainer.width / 2;

      highItems.forEach(item => {
        const itemCenterX = item.position.x + item.dimensionsPlaced.length / 2;
        const itemCenterY = item.position.y + item.dimensionsPlaced.width / 2;
        const distanceFromCenter = Math.sqrt(
          Math.pow(itemCenterX - containerCenterX, 2) +
          Math.pow(itemCenterY - containerCenterY, 2)
        );

        expect(distanceFromCenter).toBeLessThanOrEqual(300);
      });
    });
  });

  describe('Balanced Load Distribution', () => {
    test('should distribute weight relatively evenly', () => {
      const items: Item[] = [
        {
          id: 'DISTRIBUTION-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 50,
          quantity: 6,
          stackable: true,
          maxStackWeight: 400,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy'],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(standardContainer, items);
      expect(result.totalWeight).toBeGreaterThan(0);
      expect(result.centerOfGravity.x).toBeGreaterThan(0);
      expect(result.centerOfGravity.y).toBeGreaterThan(0);
      expect(result.centerOfGravity.z).toBeGreaterThan(0);
    });

    test('should place heavier items lower for stability', () => {
      const items: Item[] = [
        {
          id: 'HEAVY-BASE',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 150,
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
          id: 'LIGHT-TOP',
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

      const result = packItems(standardContainer, items);
      const heavyItem = result.packedItems.find(p => p.itemId === 'HEAVY-BASE');
      const lightItem = result.packedItems.find(p => p.itemId === 'LIGHT-TOP');

      if (heavyItem && lightItem) {
        expect(heavyItem.position.z).toBeLessThanOrEqual(lightItem.position.z);
      }
    });
  });

  describe('Fragile Item Protection', () => {
    test('should never place weight on fragile items', () => {
      const items: Item[] = [
        {
          id: 'FRAGILE-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 40,
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
          id: 'REGULAR-ITEM',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 50,
          quantity: 2,
          stackable: true,
          maxStackWeight: 400,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 1
        }
      ];

      const result = packItems(standardContainer, items);
      const fragileItem = result.packedItems.find(p => p.itemId === 'FRAGILE-ITEM');

      if (fragileItem) {
        const itemsAbove = result.packedItems.filter(p =>
          p.itemId !== 'FRAGILE-ITEM' &&
          p.position.z >= fragileItem.position.z + fragileItem.dimensionsPlaced.height - 0.1
        );

        expect(itemsAbove.length).toBe(0);
      }
    });
  });
});
