import { createBoundingBox, boundingBoxesOverlap, isWithinContainerBounds } from '../utils/geometry';
import { Position3D, ItemDimensions } from '../models';

describe('Geometry Utilities', () => {
  describe('createBoundingBox', () => {
    it('should create a bounding box with correct coordinates', () => {
      const position: Position3D = { x: 10, y: 20, z: 30 };
      const dimensions: ItemDimensions = { length: 100, width: 50, height: 25 };

      const bbox = createBoundingBox(position, dimensions);

      expect(bbox.minX).toBe(10);
      expect(bbox.minY).toBe(20);
      expect(bbox.minZ).toBe(30);
      expect(bbox.maxX).toBe(110);
      expect(bbox.maxY).toBe(70);
      expect(bbox.maxZ).toBe(55);
    });
  });

  describe('boundingBoxesOverlap', () => {
    it('should detect overlapping boxes', () => {
      const box1 = { minX: 0, minY: 0, minZ: 0, maxX: 100, maxY: 100, maxZ: 100 };
      const box2 = { minX: 50, minY: 50, minZ: 50, maxX: 150, maxY: 150, maxZ: 150 };

      expect(boundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should detect non-overlapping boxes (separated)', () => {
      const box1 = { minX: 0, minY: 0, minZ: 0, maxX: 100, maxY: 100, maxZ: 100 };
      const box2 = { minX: 100, minY: 100, minZ: 100, maxX: 150, maxY: 150, maxZ: 150 };

      expect(boundingBoxesOverlap(box1, box2)).toBe(false);
    });

    it('should detect non-overlapping boxes (no X overlap)', () => {
      const box1 = { minX: 0, minY: 0, minZ: 0, maxX: 100, maxY: 100, maxZ: 100 };
      const box2 = { minX: 150, minY: 50, minZ: 50, maxX: 200, maxY: 150, maxZ: 150 };

      expect(boundingBoxesOverlap(box1, box2)).toBe(false);
    });
  });

  describe('isWithinContainerBounds', () => {
    it('should validate item within bounds', () => {
      const bbox = { minX: 10, minY: 10, minZ: 10, maxX: 100, maxY: 100, maxZ: 100 };

      expect(isWithinContainerBounds(bbox, 200, 200, 200)).toBe(true);
    });

    it('should reject item exceeding length', () => {
      const bbox = { minX: 10, minY: 10, minZ: 10, maxX: 300, maxY: 100, maxZ: 100 };

      expect(isWithinContainerBounds(bbox, 200, 200, 200)).toBe(false);
    });

    it('should reject item exceeding width', () => {
      const bbox = { minX: 10, minY: 10, minZ: 10, maxX: 100, maxY: 300, maxZ: 100 };

      expect(isWithinContainerBounds(bbox, 200, 200, 200)).toBe(false);
    });

    it('should reject item exceeding height', () => {
      const bbox = { minX: 10, minY: 10, minZ: 10, maxX: 100, maxY: 100, maxZ: 300 };

      expect(isWithinContainerBounds(bbox, 200, 200, 200)).toBe(false);
    });

    it('should reject item starting outside bounds', () => {
      const bbox = { minX: -10, minY: 10, minZ: 10, maxX: 100, maxY: 100, maxZ: 100 };

      expect(isWithinContainerBounds(bbox, 200, 200, 200)).toBe(false);
    });
  });
});
