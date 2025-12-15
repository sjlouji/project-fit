# API Reference

## Main Function

### `packItems(container, items): PackingResult`

Main entry point that packs items into a container using the Extreme Point heuristic algorithm.

**Parameters:**
- `container: Container` — Target container specifications
- `items: Item[]` — Array of items to pack

**Returns:** `PackingResult` — Packing outcome with metrics and placement data

**Example:**
```typescript
import { packItems, Container, Item } from '@sjlouji/project-fit';

const result = packItems(container, items);
console.log(`Packed ${result.itemsPacked} items with ${result.utilizationPct.toFixed(1)}% utilization`);
```

---

## Data Models

### `Container`

Represents a shipping container or truck.

```typescript
interface Container {
  id: string;              // Unique identifier
  length: number;          // Container length (units)
  width: number;           // Container width (units)
  height: number;          // Container height (units)
  maxWeight: number;       // Maximum weight capacity
  unit: string;            // Dimension unit ('cm', 'm', etc.)
  weightUnit: string;      // Weight unit ('kg', 'lbs', etc.)
}
```

**Example:**
```typescript
const container: Container = {
  id: 'TRUCK-40FT',
  length: 1360,    // cm
  width: 240,      // cm
  height: 270,     // cm
  maxWeight: 24000, // kg
  unit: 'cm',
  weightUnit: 'kg'
};
```

---

### `Item`

Represents a single item type to be packed (with quantity support).

```typescript
interface Item {
  id: string;                          // Unique identifier
  type: 'carton' | 'pallet' | 'crate' | 'drum' | 'custom';
  length: number;                      // Item length (units)
  width: number;                       // Item width (units)
  height: number;                      // Item height (units)
  weight: number;                      // Weight per unit (units)
  quantity: number;                    // Number of units to pack
  stackable: boolean;                  // Can items stack on top of this?
  maxStackWeight: number;              // Maximum weight this can support
  fragile: boolean;                    // Cannot have weight on top
  loadBearing: boolean;                // Can support weight on top
  rotationAllowed: RotationAxis[];     // Allowed rotation axes
  priority: number;                    // Loading priority (1=highest)
  deliveryStop: number;                // Multi-stop delivery order
}
```

**Parameters Explained:**

- **id**: Unique identifier for tracking (e.g., 'CARTON-001')
- **type**: Item category for grouping and handling rules
- **weight**: Applies per unit; total weight = weight × quantity
- **stackable**: If false, no other items can be placed on top
- **maxStackWeight**: Maximum cumulative weight allowed on top (if stackable=true)
- **fragile**: If true, loadBearing is automatically false
- **loadBearing**: If false, no weight can be placed on top
- **rotationAllowed**: Empty array = no rotation; ['xy', 'xz'] = can rotate on those axes
- **priority**: Lower numbers = loaded later (for accessibility/priority handling)
- **deliveryStop**: For multi-stop routes (1, 2, 3, etc.). LIFO validated.

**Example:**
```typescript
const item: Item = {
  id: 'CARTON-BOOKS',
  type: 'carton',
  length: 60,              // cm
  width: 40,               // cm
  height: 30,              // cm
  weight: 20,              // kg per carton
  quantity: 15,            // 15 cartons
  stackable: true,
  maxStackWeight: 500,     // Can stack up to 500kg on top
  fragile: false,
  loadBearing: true,
  rotationAllowed: ['xy'], // Can rotate length/width
  priority: 2,
  deliveryStop: 1
};
```

---

### `RotationAxis`

Specifies which rotation axes are allowed.

```typescript
type RotationAxis = 'xy' | 'xz' | 'yz';

// Rotation effects:
// 'xy': Rotates around Z axis (swaps length ↔ width)
// 'xz': Rotates around Y axis (swaps length ↔ height)
// 'yz': Rotates around X axis (swaps width ↔ height)
```

---

### `PlacedItem`

Represents an item that was successfully placed in the container.

```typescript
interface PlacedItem {
  itemId: string;
  quantity: number;
  position: Position3D;
  dimensionsPlaced: ItemDimensions;
  weight: number;
  rotationApplied: RotationAxis | null;
}
```

**Fields:**
- **itemId**: Reference to original item ID
- **quantity**: Number of units of this item placed
- **position**: 3D coordinates (x, y, z) of item's minimum corner
- **dimensionsPlaced**: Actual dimensions used after rotation
- **weight**: Total weight of this placement
- **rotationApplied**: Which rotation was applied (if any)

---

### `Position3D`

3D coordinates in the container.

```typescript
interface Position3D {
  x: number;  // Width direction
  y: number;  // Length direction
  z: number;  // Height direction
}
```

---

### `ItemDimensions`

Item dimensions (possibly after rotation).

```typescript
interface ItemDimensions {
  length: number;
  width: number;
  height: number;
}
```

---

### `PackingResult`

Complete result of the packing operation.

```typescript
interface PackingResult {
  containerId: string;
  utilizationPct: number;          // Volume utilization (0-100)
  totalWeight: number;             // Total weight of packed items
  itemsPacked: number;             // Count of items packed
  itemsUnpacked: number;           // Count of items not packed
  unpackedItems: string[];         // IDs of unpacked items
  packedItems: PlacedItem[];       // All placed items
  centerOfGravity: Position3D;     // Weighted average position
  warnings: string[];              // Any warnings (empty if all OK)
  computationTimeMs: number;       // Algorithm execution time
}
```

**Example Usage:**
```typescript
const result = packItems(container, items);

console.log(`Container: ${result.containerId}`);
console.log(`Packed: ${result.itemsPacked}/${result.itemsPacked + result.itemsUnpacked}`);
console.log(`Utilization: ${result.utilizationPct.toFixed(2)}%`);
console.log(`Weight: ${result.totalWeight}kg`);
console.log(`CoG: (${result.centerOfGravity.x.toFixed(0)}, ${result.centerOfGravity.y.toFixed(0)}, ${result.centerOfGravity.z.toFixed(0)})`);
console.log(`Computed in ${result.computationTimeMs}ms`);

if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}
```

---

### `DeliveryOrderViolation`

Reported when multi-stop delivery order is not LIFO-compliant.

```typescript
interface DeliveryOrderViolation {
  stop1: number;           // Earlier delivery stop
  stop2: number;           // Later delivery stop
  stop1AvgZ: number;       // Average Z height of stop1 items
  stop2AvgZ: number;       // Average Z height of stop2 items
  message: string;         // Human-readable explanation
}
```

**What it means:** Items for `stop1` should be above items for `stop2`, but aren't. They need to be repositioned before unloading.

---

### `DeliveryOrderResult`

Result of LIFO delivery order validation.

```typescript
interface DeliveryOrderResult {
  valid: boolean;
  violations: DeliveryOrderViolation[];
  summary: string;
}
```

---

## Utility Functions

### `ConstraintValidator.validateDeliveryOrderSequence(placedItems, itemsMap): DeliveryOrderResult`

Validates that items are arranged in LIFO order for multi-stop delivery.

**Parameters:**
- `placedItems: PlacedItem[]` — All placed items
- `itemsMap: Map<string, Item>` — Mapping of item IDs to Item definitions

**Returns:** `DeliveryOrderResult` with validity status and any violations

**Example:**
```typescript
import { ConstraintValidator } from '@sjlouji/project-fit';

const itemsMap = new Map(items.map(item => [item.id, item]));
const validation = ConstraintValidator.validateDeliveryOrderSequence(
  result.packedItems,
  itemsMap
);

if (validation.valid) {
  console.log('✓ Load is LIFO compliant');
} else {
  console.log('✗ Reposition items:');
  validation.violations.forEach(v => console.log(`  ${v.message}`));
}
```

---

## Type Definitions Summary

| Type | Purpose |
|------|---------|
| `Container` | Target container specs |
| `Item` | Item type to pack |
| `PlacedItem` | Placement result |
| `PackingResult` | Full packing output |
| `Position3D` | 3D coordinates |
| `ItemDimensions` | L×W×H dimensions |
| `RotationAxis` | Rotation type |
| `DeliveryOrderViolation` | LIFO violation detail |
| `DeliveryOrderResult` | LIFO validation result |

---

## Common Patterns

### Packing with Constraints

```typescript
const items = [
  {
    id: 'FRAGILE-GLASS',
    type: 'carton',
    length: 30, width: 30, height: 30,
    weight: 5,
    quantity: 10,
    stackable: false,     // Cannot stack
    fragile: true,        // No weight on top
    loadBearing: false,   // Cannot support weight
    rotationAllowed: [],  // No rotation
    priority: 1,          // Load early
    deliveryStop: 1
  }
];

const result = packItems(container, items);
// Result: Items placed individually, no stacking
```

### Multi-Stop Delivery

```typescript
const multiStopItems = [
  { id: 'STOP-1', deliveryStop: 1, ... },
  { id: 'STOP-2', deliveryStop: 2, ... },
  { id: 'STOP-3', deliveryStop: 3, ... }
];

const result = packItems(container, multiStopItems);
const validation = ConstraintValidator.validateDeliveryOrderSequence(
  result.packedItems,
  new Map(multiStopItems.map(i => [i.id, i]))
);

// STOP-1 items should be at top (highest Z),
// STOP-3 items at bottom, for LIFO unloading
```

### Mixed Item Types

```typescript
const items = [
  { id: 'PALLET', type: 'pallet', length: 120, ... },
  { id: 'CARTON', type: 'carton', length: 60, ... },
  { id: 'DRUM', type: 'drum', length: 90, ... }
];

const result = packItems(container, items);
// Algorithm handles different types, sizes, weights automatically
```
