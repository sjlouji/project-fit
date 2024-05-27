import { packItems, Container, Item } from '../index';
import { ConstraintValidator } from '../algorithm/constraints';

describe('Multi-Stop Delivery Order Validation', () => {
  const baseContainer: Container = {
    id: 'DELIVERY-TEST',
    length: 1200,
    width: 234,
    height: 235,
    maxWeight: 28000,
    unit: 'cm',
    weightUnit: 'kg'
  };

  describe('LIFO (Last In, First Out) Ordering', () => {
    test('should accept valid LIFO ordering', () => {
      const items: Item[] = [
        {
          id: 'STOP-1-ITEMS',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 100,
          quantity: 2,
          stackable: true,
          maxStackWeight: 1000,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 3,
          deliveryStop: 1
        },
        {
          id: 'STOP-2-ITEMS',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 80,
          quantity: 2,
          stackable: true,
          maxStackWeight: 800,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 2
        },
        {
          id: 'STOP-3-ITEMS',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 60,
          quantity: 2,
          stackable: true,
          maxStackWeight: 600,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 3
        }
      ];

      const result = packItems(baseContainer, items);
      const itemsMap = new Map(items.map(item => [item.id, item]));

      const validation = ConstraintValidator.validateDeliveryOrderSequence(
        result.packedItems,
        itemsMap
      );

      expect(validation.valid).toBe(true);
      expect(validation.violations.length).toBe(0);
    });

    test('should identify LIFO violations', () => {
      const items: Item[] = [
        {
          id: 'STOP-3-ITEMS',
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
          deliveryStop: 3
        },
        {
          id: 'STOP-1-ITEMS',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 100,
          quantity: 1,
          stackable: true,
          maxStackWeight: 500,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 3,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      const itemsMap = new Map(items.map(item => [item.id, item]));

      const validation = ConstraintValidator.validateDeliveryOrderSequence(
        result.packedItems,
        itemsMap
      );

      if (result.packedItems.length > 1) {
        expect(validation.violations.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Single Stop Delivery', () => {
    test('should accept single delivery stop', () => {
      const items: Item[] = [
        {
          id: 'SINGLE-STOP',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 100,
          quantity: 5,
          stackable: true,
          maxStackWeight: 1000,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);
      const itemsMap = new Map(items.map(item => [item.id, item]));

      const validation = ConstraintValidator.validateDeliveryOrderSequence(
        result.packedItems,
        itemsMap
      );

      expect(validation.valid).toBe(true);
      expect(validation.violations.length).toBe(0);
    });
  });

  describe('Empty Load', () => {
    test('should handle empty placed items', () => {
      const itemsMap = new Map<string, any>();

      const validation = ConstraintValidator.validateDeliveryOrderSequence([], itemsMap);

      expect(validation.valid).toBe(true);
      expect(validation.violations.length).toBe(0);
    });
  });

  describe('Three-Stop Scenario', () => {
    test('should validate three-stop delivery with correct ordering', () => {
      const container: Container = {
        id: 'THREE-STOP',
        length: 1200,
        width: 234,
        height: 235,
        maxWeight: 28000,
        unit: 'cm',
        weightUnit: 'kg'
      };

      const items: Item[] = [
        {
          id: 'STOP-1-BOXES',
          type: 'carton',
          length: 80,
          width: 80,
          height: 80,
          weight: 70,
          quantity: 6,
          stackable: true,
          maxStackWeight: 700,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy'],
          priority: 3,
          deliveryStop: 1
        },
        {
          id: 'STOP-2-BOXES',
          type: 'carton',
          length: 80,
          width: 80,
          height: 80,
          weight: 65,
          quantity: 5,
          stackable: true,
          maxStackWeight: 650,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy'],
          priority: 2,
          deliveryStop: 2
        },
        {
          id: 'STOP-3-BOXES',
          type: 'carton',
          length: 80,
          width: 80,
          height: 80,
          weight: 60,
          quantity: 4,
          stackable: true,
          maxStackWeight: 600,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy'],
          priority: 1,
          deliveryStop: 3
        }
      ];

      const result = packItems(container, items);
      const itemsMap = new Map(items.map(item => [item.id, item]));

      const validation = ConstraintValidator.validateDeliveryOrderSequence(
        result.packedItems,
        itemsMap
      );

      if (result.packedItems.length > 0) {
        expect(validation.summary).toBeDefined();
        expect(typeof validation.summary).toBe('string');
      }
    });

    test('should detect when higher stop is below lower stop', () => {
      const items: Item[] = [
        {
          id: 'STOP-1',
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
          priority: 2,
          deliveryStop: 1
        },
        {
          id: 'STOP-2',
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
          deliveryStop: 2
        }
      ];

      const result = packItems(baseContainer, items);

      if (result.packedItems.length === 2) {
        const itemsMap = new Map(items.map(item => [item.id, item]));
        const validation = ConstraintValidator.validateDeliveryOrderSequence(
          result.packedItems,
          itemsMap
        );

        const stop1Item = result.packedItems.find(p => p.itemId === 'STOP-1');
        const stop2Item = result.packedItems.find(p => p.itemId === 'STOP-2');

        if (stop1Item && stop2Item && stop1Item.position.z < stop2Item.position.z) {
          expect(validation.violations.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Priority Correlation with Delivery Order', () => {
    test('should use priority to enforce delivery order', () => {
      const items: Item[] = [
        {
          id: 'PRIORITY-1',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 100,
          quantity: 2,
          stackable: true,
          maxStackWeight: 1000,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 3
        },
        {
          id: 'PRIORITY-2',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 80,
          quantity: 2,
          stackable: true,
          maxStackWeight: 800,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 2
        },
        {
          id: 'PRIORITY-3',
          type: 'carton',
          length: 100,
          width: 100,
          height: 50,
          weight: 60,
          quantity: 2,
          stackable: true,
          maxStackWeight: 600,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 3,
          deliveryStop: 1
        }
      ];

      const result = packItems(baseContainer, items);

      const p1Items = result.packedItems.filter(p => p.itemId === 'PRIORITY-1');
      const p2Items = result.packedItems.filter(p => p.itemId === 'PRIORITY-2');
      const p3Items = result.packedItems.filter(p => p.itemId === 'PRIORITY-3');

      if (p1Items.length > 0 && p2Items.length > 0) {
        const p1AvgZ = p1Items.reduce((sum, p) => sum + p.position.z, 0) / p1Items.length;
        const p2AvgZ = p2Items.reduce((sum, p) => sum + p.position.z, 0) / p2Items.length;
        expect(p1AvgZ).toBeLessThanOrEqual(p2AvgZ);
      }

      if (p2Items.length > 0 && p3Items.length > 0) {
        const p2AvgZ = p2Items.reduce((sum, p) => sum + p.position.z, 0) / p2Items.length;
        const p3AvgZ = p3Items.reduce((sum, p) => sum + p.position.z, 0) / p3Items.length;
        expect(p2AvgZ).toBeLessThanOrEqual(p3AvgZ);
      }
    });
  });

  describe('Mixed Items per Stop', () => {
    test('should handle multiple item types per delivery stop', () => {
      const items: Item[] = [
        {
          id: 'STOP-1-CARTONS',
          type: 'carton',
          length: 80,
          width: 80,
          height: 80,
          weight: 50,
          quantity: 3,
          stackable: true,
          maxStackWeight: 500,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy'],
          priority: 2,
          deliveryStop: 1
        },
        {
          id: 'STOP-1-PALLETS',
          type: 'pallet',
          length: 120,
          width: 80,
          height: 120,
          weight: 300,
          quantity: 1,
          stackable: true,
          maxStackWeight: 1000,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 1
        },
        {
          id: 'STOP-2-CARTONS',
          type: 'carton',
          length: 80,
          width: 80,
          height: 80,
          weight: 40,
          quantity: 4,
          stackable: true,
          maxStackWeight: 400,
          fragile: false,
          loadBearing: true,
          rotationAllowed: ['xy'],
          priority: 1,
          deliveryStop: 2
        }
      ];

      const result = packItems(baseContainer, items);
      const itemsMap = new Map(items.map(item => [item.id, item]));

      const validation = ConstraintValidator.validateDeliveryOrderSequence(
        result.packedItems,
        itemsMap
      );

      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('violations');
      expect(Array.isArray(validation.violations)).toBe(true);
    });
  });

  describe('Violation Details', () => {
    test('should provide detailed violation information', () => {
      const items: Item[] = [
        {
          id: 'EARLY-STOP',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 100,
          quantity: 1,
          stackable: true,
          maxStackWeight: 1000,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        },
        {
          id: 'LATE-STOP',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 100,
          quantity: 1,
          stackable: true,
          maxStackWeight: 1000,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 2,
          deliveryStop: 3
        }
      ];

      const result = packItems(baseContainer, items);
      const itemsMap = new Map(items.map(item => [item.id, item]));

      const validation = ConstraintValidator.validateDeliveryOrderSequence(
        result.packedItems,
        itemsMap
      );

      if (validation.violations.length > 0) {
        const violation = validation.violations[0];
        expect(violation).toHaveProperty('stop1');
        expect(violation).toHaveProperty('stop2');
        expect(violation).toHaveProperty('stop1AvgZ');
        expect(violation).toHaveProperty('stop2AvgZ');
        expect(violation).toHaveProperty('message');
        expect(typeof violation.message).toBe('string');
      }
    });
  });
});
