# Project Fit — 3D Bin Packing Algorithm

A TypeScript implementation of a 3D bin packing algorithm optimized for efficiently arranging cargo items inside truck containers. The algorithm maximizes space utilization while respecting physical constraints like weight limits, stackability, and fragility.

## Features

- **Extreme Point Heuristic**: Fast and effective packing algorithm (milliseconds for typical loads)
- **Multi-item Support**: Handles various item types (cartons, pallets, crates, drums)
- **Rotation Support**: Configurable allowed rotations per item type
- **Constraint Handling**:
  - Container bounds validation
  - Overlap detection
  - Weight limit enforcement
  - Stackability rules
  - Fragile item protection
- **Metrics & Analytics**:
  - Volume utilization percentage
  - Weight utilization percentage
  - Center of gravity calculation
  - Computation time tracking
- **Comprehensive Testing**: Unit and integration tests with high coverage

## Project Structure

```
src/
├── models/              # Data models (Container, Item, Result)
├── algorithm/           # Core packing logic
│   ├── packer.ts       # Main BinPacker class
│   ├── extremePoint.ts # Extreme Point heuristic
│   └── constraints.ts  # Constraint validators
├── utils/              # Utilities
│   ├── geometry.ts     # 3D geometry helpers
│   └── rotations.ts    # Item rotation logic
└── __tests__/          # Test files
```

## Installation

```bash
pnpm install
```

## Quick Start

```typescript
import { packItems, Container, Item } from 'project-fit';

const container: Container = {
  id: 'TRUCK-001',
  length: 1360,
  width: 240,
  height: 270,
  maxWeight: 24000,
  unit: 'cm',
  weightUnit: 'kg'
};

const items: Item[] = [
  {
    id: 'CARTON-001',
    type: 'carton',
    length: 60,
    width: 40,
    height: 40,
    weight: 15,
    quantity: 20,
    stackable: true,
    maxStackWeight: 500,
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy', 'xz'],
    priority: 1,
    deliveryStop: 1
  }
];

const result = packItems(container, items);

console.log(`Utilization: ${result.utilizationPct.toFixed(2)}%`);
console.log(`Items packed: ${result.itemsPacked}/${result.itemsPacked + result.itemsUnpacked}`);
console.log(`Center of gravity: (${result.centerOfGravity.x.toFixed(0)}, ${result.centerOfGravity.y.toFixed(0)}, ${result.centerOfGravity.z.toFixed(0)})`);
```

## Building

```bash
pnpm build
```

Output is generated in the `dist/` directory.

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

## Scripts

- `pnpm build` — Compile TypeScript to JavaScript
- `pnpm dev` — Watch mode for development
- `pnpm test` — Run all tests
- `pnpm test:watch` — Run tests in watch mode
- `pnpm test:coverage` — Generate coverage report
- `pnpm lint` — Lint code with ESLint
- `pnpm clean` — Remove build artifacts

## Algorithm Overview

### Extreme Point Heuristic

The algorithm works by:

1. **Sort items** by volume (largest first) and priority
2. **Initialize extreme points** at the container origin (0, 0, 0)
3. **For each item**:
   - Try each extreme point as a candidate position
   - Try all allowed orientations
   - Check feasibility (bounds, overlap, weight, stackability)
   - Select placement with best score (lowest Z, then X, then Y)
   - Place item and update extreme points
4. **Return packing result** with metrics and unpacked items

### Time Complexity

- **Space**: O(n) for placed items
- **Time**: O(n² × m) where n = items and m = extreme points (typically < 100ms for standard truck loads)

## API Reference

### `packItems(container, items): PackingResult`

Main entry point that packs items into a container.

**Parameters:**
- `container: Container` — Target container dimensions and limits
- `items: Item[]` — Items to pack

**Returns:** `PackingResult` with placement data and metrics

### Data Models

#### `Container`
```typescript
{
  id: string;
  length: number;          // cm
  width: number;           // cm
  height: number;          // cm
  maxWeight: number;       // kg
  unit: string;
  weightUnit: string;
}
```

#### `Item`
```typescript
{
  id: string;
  type: 'carton' | 'pallet' | 'crate' | 'drum' | 'custom';
  length: number;
  width: number;
  height: number;
  weight: number;          // kg per unit
  quantity: number;
  stackable: boolean;
  maxStackWeight: number;
  fragile: boolean;
  loadBearing: boolean;
  rotationAllowed: RotationAxis[];
  priority: number;        // 1 = load last
  deliveryStop: number;    // Multi-stop routing
}
```

#### `PackingResult`
```typescript
{
  containerId: string;
  utilizationPct: number;
  totalWeight: number;
  itemsPacked: number;
  itemsUnpacked: number;
  unpackedItems: string[];
  packedItems: PlacedItem[];
  centerOfGravity: Position3D;
  warnings: string[];
  metrics: {
    volumeEfficiency: number;
    weightEfficiency: number;
    computationTime: number;
  };
  computationTimeMs: number;
}
```

## Roadmap

- [x] Phase 1: Foundation (data models, Extreme Point heuristic, basic constraints)
- [ ] Phase 2: Advanced constraints (rotations, stackability, delivery ordering)
- [ ] Phase 3: Optimization (Simulated Annealing, Genetic Algorithm)
- [ ] Phase 4: Performance tuning and stress testing

## License

MIT
