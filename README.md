# Project Fit — 3D Bin Packing Algorithm

A TypeScript library that solves the 3D bin packing problem. It figures out how to efficiently pack items (boxes, pallets, etc.) into containers and trucks while respecting real-world constraints like weight limits and fragility.

## What It Does

Project Fit helps you pack cargo into containers optimally. Instead of manually arranging items, the algorithm automatically finds good placements that maximize space usage while keeping things physically safe (no putting heavy items on delicate ones, respecting weight limits, etc).

Common uses:
- **E-commerce** — Packing orders into boxes for shipment
- **Logistics** — Loading trucks with multiple stops
- **Manufacturing** — Organizing warehouse storage
- **Food Distribution** — Handling temperature-sensitive products

## Key Features

- **Fast Packing** — Optimizes typical truck loads in milliseconds
- **Smart Placement** — Finds good arrangements automatically
- **Rotation Support** — Rotates items to fit better
- **Real-World Rules**:
  - Respects weight limits
  - Prevents stacking on fragile items
  - Enforces stackability rules
  - Checks load bearing capacity
  - Prevents top-heavy loading
- **Multi-Stop Routes** — Validates items are loaded in reverse order for unloading
- **Detailed Metrics** — Shows space used, weight used, center of gravity, and more

## Project Structure

```
project-fit/
├── src/
│   ├── models/           # Data types (Container, Item, etc)
│   ├── algorithm/        # Packing engine
│   ├── utils/            # Geometry and rotation helpers
│   └── __tests__/        # Tests (39+ test cases)
├── examples/             # Real-world examples
├── docs/                 # Guides and documentation
├── dist/                 # Compiled code (generated)
└── package.json
```

## Quick Start

Install:
```bash
npm install @sjlouji/project-fit
```

Basic example:
```typescript
import { packItems, Container, Item } from '@sjlouji/project-fit';

const truck: Container = {
  id: 'TRUCK-001',
  length: 1360,   // cm
  width: 240,
  height: 270,
  maxWeight: 24000, // kg
  unit: 'cm',
  weightUnit: 'kg'
};

const items: Item[] = [
  {
    id: 'CARTON-A',
    type: 'carton',
    length: 60,
    width: 40,
    height: 40,
    weight: 15,     // kg per carton
    quantity: 20,   // pack 20 of these
    stackable: true,
    maxStackWeight: 500, // can stack up to 500kg on top
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy', 'xz'],
    priority: 1,
    deliveryStop: 1
  }
];

const result = packItems(truck, items);

console.log(`Space used: ${result.utilizationPct.toFixed(1)}%`);
console.log(`Packed: ${result.itemsPacked} items`);
console.log(`Weight: ${result.totalWeight}kg`);
```

## Visualize Your Packing

Want to see how items are arranged? Use **[Project Fit Viewer](https://github.com/sjlouji/project-fit-viewer)** — a 3D visualization tool that shows exactly how items are packed inside your container.

## Documentation

- **[Getting Started & Contributing](./docs/CONTRIBUTING.md)** — Setup, building, testing
- **[How It Works](./docs/ALGORITHMS.md)** — Explains the packing algorithm and constraints
- **[API Documentation](./docs/API.md)** — Complete function and type reference

## Common Commands

```bash
npm run build          # Compile TypeScript
npm run dev           # Watch and compile on changes
npm run test          # Run all tests
npm run test:watch    # Tests with watch mode
npm run test:coverage # See which code is tested
npm run lint          # Check code style
npm run clean         # Delete build folder
```

## License

MIT — Free to use and modify. See [LICENSE](./LICENSE) for details.

---

Check the `examples/` folder to see how to use the library for different scenarios.
