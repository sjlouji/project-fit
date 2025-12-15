# Project Fit — 3D Bin Packing Algorithm

A professional TypeScript implementation of a 3D bin packing algorithm optimized for logistics and cargo management. Efficiently arranges items into containers while respecting physical constraints like weight limits, stackability, fragility, and delivery order requirements.

## What is Project Fit?

Project Fit solves the 3D bin packing problem using an Extreme Point heuristic algorithm. It's designed for real-world logistics scenarios: from e-commerce warehouses to manufacturing plants to food distribution networks. The algorithm maximizes container utilization while enforcing realistic physical constraints.

## Features

- **Extreme Point Heuristic** — Fast, effective packing algorithm (typical truck loads in milliseconds)
- **Multi-Stop Delivery** — LIFO (Last In, First Out) validation for route optimization
- **Flexible Item Types** — Supports cartons, pallets, crates, drums, and custom containers
- **Rotation Support** — Configurable rotation axes per item
- **Physics-Based Constraints**:
  - Weight limits and cascading stack weight validation
  - Stackability rules with maximum stack weight enforcement
  - Fragile item protection (no weight on top)
  - Load bearing capacity checks
  - Center of gravity stability for high stacks
- **Comprehensive Metrics**:
  - Volume and weight utilization percentages
  - Center of gravity calculation
  - Computation time tracking
  - LIFO compliance reporting

## Project Structure

```
project-fit/
├── src/
│   ├── models/              # TypeScript interfaces
│   ├── algorithm/           # Core packing engine
│   │   ├── packer.ts       # Main BinPacker class
│   │   ├── extremePoint.ts # Heuristic implementation
│   │   └── constraints.ts  # Constraint validation
│   ├── utils/              # Geometry and rotation utilities
│   └── __tests__/          # 39+ unit and integration tests
├── examples/               # Real-world scenario examples
├── docs/                   # Detailed documentation
├── dist/                   # Compiled JavaScript (generated)
└── package.json
```

## Quick Start

```bash
npm install @sjlouji/project-fit
```

```typescript
import { packItems, Container, Item } from '@sjlouji/project-fit';

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
console.log(`Items packed: ${result.itemsPacked}`);
console.log(`Weight: ${result.totalWeight}kg`);
```

## Documentation

- **[Contributing & Development](./docs/CONTRIBUTING.md)** — Setup, building, testing, and contributing guide
- **[Algorithms & Logics](./docs/ALGORITHMS.md)** — Detailed explanation of the Extreme Point heuristic and physics constraints
- **[API Reference](./docs/API.md)** — Complete API documentation with data models and methods

## Development Scripts

```bash
npm run build          # Compile TypeScript
npm run dev           # Watch mode
npm run test          # Run all tests
npm run test:watch    # Watch mode tests
npm run test:coverage # Coverage report
npm run lint          # ESLint check
npm run clean         # Remove build artifacts
```

## License

MIT — See [LICENSE](./LICENSE) file for details

---

For examples of real-world use cases, check the `examples/` directory.
