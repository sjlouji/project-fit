import { BinPacker, packItems } from '../index';
import { Container, Item } from '../models';

describe('BinPacker', () => {
  let container: Container;
  let items: Item[];

  beforeEach(() => {
    container = {
      id: 'TRUCK-001',
      length: 360,
      width: 240,
      height: 270,
      maxWeight: 5000,
      unit: 'cm',
      weightUnit: 'kg'
    };

    items = [
      {
        id: 'CARTON-A',
        type: 'carton',
        length: 60,
        width: 40,
        height: 40,
        weight: 15,
        quantity: 5,
        stackable: true,
        maxStackWeight: 200,
        fragile: false,
        loadBearing: true,
        rotationAllowed: ['xy', 'xz'],
        priority: 1,
        deliveryStop: 1
      },
      {
        id: 'CARTON-B',
        type: 'carton',
        length: 100,
        width: 50,
        height: 50,
        weight: 30,
        quantity: 3,
        stackable: true,
        maxStackWeight: 300,
        fragile: false,
        loadBearing: true,
        rotationAllowed: ['xy'],
        priority: 2,
        deliveryStop: 1
      }
    ];
  });

  describe('pack', () => {
    it('should pack items into container', () => {
      const packer = new BinPacker(container, items);
      const result = packer.pack();

      expect(result.containerId).toBe('TRUCK-001');
      expect(result.itemsPacked).toBeGreaterThan(0);
      expect(result.itemsUnpacked).toBeLessThanOrEqual(items.reduce((sum, i) => sum + i.quantity, 0));
      expect(result.utilizationPct).toBeGreaterThan(0);
      expect(result.utilizationPct).toBeLessThanOrEqual(100);
    });

    it('should not exceed container weight limit', () => {
      const packer = new BinPacker(container, items);
      const result = packer.pack();

      expect(result.totalWeight).toBeLessThanOrEqual(container.maxWeight);
    });

    it('should calculate correct metrics', () => {
      const packer = new BinPacker(container, items);
      const result = packer.pack();

      expect(result.metrics.volumeEfficiency).toBe(result.utilizationPct);
      expect(result.metrics.computationTime).toBe(result.computationTimeMs);
      expect(result.computationTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should return center of gravity', () => {
      const packer = new BinPacker(container, items);
      const result = packer.pack();

      const cog = result.centerOfGravity;
      if (result.itemsPacked > 0) {
        expect(cog.x).toBeGreaterThanOrEqual(0);
        expect(cog.y).toBeGreaterThanOrEqual(0);
        expect(cog.z).toBeGreaterThanOrEqual(0);
      }
    });

    it('should place all items if they fit', () => {
      // Create items that should fit perfectly
      const smallContainer: Container = {
        id: 'SMALL-TRUCK',
        length: 200,
        width: 100,
        height: 100,
        maxWeight: 1000,
        unit: 'cm',
        weightUnit: 'kg'
      };

      const smallItems: Item[] = [
        {
          id: 'SMALL-CARTON',
          type: 'carton',
          length: 100,
          width: 100,
          height: 100,
          weight: 50,
          quantity: 1,
          stackable: true,
          maxStackWeight: 100,
          fragile: false,
          loadBearing: true,
          rotationAllowed: [],
          priority: 1,
          deliveryStop: 1
        }
      ];

      const packer = new BinPacker(smallContainer, smallItems);
      const result = packer.pack();

      expect(result.itemsPacked).toBe(1);
      expect(result.itemsUnpacked).toBe(0);
    });
  });

  describe('packItems', () => {
    it('should be a convenience function that works', () => {
      const result = packItems(container, items);

      expect(result.containerId).toBe('TRUCK-001');
      expect(result.itemsPacked).toBeGreaterThan(0);
    });
  });
});
