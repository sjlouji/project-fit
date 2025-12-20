# API Reference

## Main Function

### `packItems(container, items)`

Packs items into a container and returns results.

**Input:**
- `container` — Container dimensions and limits
- `items` — List of items to pack

**Output:** Results with placement info and metrics

**Example:**
```typescript
import { packItems } from '@sjlouji/project-fit';

const result = packItems(myContainer, myItems);
console.log(`Packed: ${result.itemsPacked} items`);
console.log(`Used: ${result.utilizationPct.toFixed(1)}%`);
```

---

## Container

Represents the truck or box you're packing into.

```typescript
interface Container {
  id: string;           // Name/ID for this container
  length: number;       // Length (in cm, m, etc)
  width: number;        // Width
  height: number;       // Height
  maxWeight: number;    // Max weight (in kg, lbs, etc)
  unit: string;         // Unit for dimensions ('cm', 'm')
  weightUnit: string;   // Unit for weight ('kg', 'lbs')
}
```

**Example:**
```typescript
const truck: Container = {
  id: 'TRUCK-40FT',
  length: 1360,
  width: 240,
  height: 270,
  maxWeight: 24000,
  unit: 'cm',
  weightUnit: 'kg'
};
```

---

## Item

Represents something you want to pack (with quantity).

```typescript
interface Item {
  id: string;                      // Item name/ID
  type: string;                    // 'carton', 'pallet', 'crate', 'drum'
  length: number;                  // Item length
  width: number;                   // Item width
  height: number;                  // Item height
  weight: number;                  // Weight per unit
  quantity: number;                // How many to pack
  stackable: boolean;              // Can other items sit on top?
  maxStackWeight: number;          // Max weight on top (if stackable)
  fragile: boolean;                // Breakable? Nothing goes on top
  loadBearing: boolean;            // Can support items on top?
  rotationAllowed: string[];       // Allowed rotations ['xy', 'xz']
  priority: number;                // Load order (1 = high priority)
  deliveryStop: number;            // Multi-stop delivery order
}
```

**What each field means:**

- **id** — Unique name (e.g. 'BOX-001')
- **type** — Category (mainly for organization)
- **weight** — Per unit (total = weight × quantity)
- **stackable** — If false, nothing goes on top
- **maxStackWeight** — If stackable, this is the limit for weight on top
- **fragile** — True = protect it, no weight allowed on top
- **loadBearing** — False = can't support weight (like fragile)
- **rotationAllowed** — Empty = no rotation; ['xy'] = can spin around Z axis
- **priority** — Lower = loaded first (gets more protected positions)
- **deliveryStop** — For routes (1, 2, 3...) unload in reverse

**Example:**
```typescript
const item: Item = {
  id: 'BOOKS-BOX',
  type: 'carton',
  length: 60,
  width: 40,
  height: 30,
  weight: 20,              // 20kg per box
  quantity: 15,            // Pack 15 boxes
  stackable: true,
  maxStackWeight: 500,     // Can stack 500kg on top
  fragile: false,
  loadBearing: true,
  rotationAllowed: ['xy'],
  priority: 2,
  deliveryStop: 1
};
```

---

## Rotation Types

```typescript
type RotationAxis = 'xy' | 'xz' | 'yz';

// 'xy': Rotate around Z (height) axis
//   Original: length=60, width=40, height=30
//   After: length=40, width=60, height=30

// 'xz': Rotate around Y axis
//   Original: length=60, width=40, height=30
//   After: length=30, width=40, height=60

// 'yz': Rotate around X axis
//   Original: length=60, width=40, height=30
//   After: length=60, width=30, height=40
```

---

## PlacedItem

An item that was successfully placed.

```typescript
interface PlacedItem {
  itemId: string;           // Which item type
  quantity: number;         // How many units
  position: Position3D;     // Where it is (x, y, z)
  dimensionsPlaced: Dimensions;  // Size after rotation
  weight: number;           // Total weight
  rotationApplied: string;  // Which rotation was used
}
```

---

## Position3D

A 3D location in the container.

```typescript
interface Position3D {
  x: number;  // Distance from left edge
  y: number;  // Distance from front edge
  z: number;  // Distance from bottom edge
}
```

---

## Dimensions

Width, length, height.

```typescript
interface ItemDimensions {
  length: number;
  width: number;
  height: number;
}
```

---

## Packing Result

What you get back after packing.

```typescript
interface PackingResult {
  containerId: string;      // Which container
  utilizationPct: number;   // % of space used
  totalWeight: number;      // Total weight packed
  itemsPacked: number;      // How many items fit
  itemsUnpacked: number;    // How many didn't fit
  unpackedItems: string[];  // Which items didn't fit
  packedItems: PlacedItem[]; // All placed items
  centerOfGravity: Position3D; // Balance point
  warnings: string[];       // Any issues
  computationTimeMs: number; // How long it took
}
```

**Example usage:**
```typescript
const result = packItems(container, items);

console.log(`Container: ${result.containerId}`);
console.log(`Packed: ${result.itemsPacked} out of ${result.itemsPacked + result.itemsUnpacked}`);
console.log(`Space: ${result.utilizationPct.toFixed(1)}%`);
console.log(`Weight: ${result.totalWeight}kg`);
console.log(`Balance point: (${result.centerOfGravity.x}, ${result.centerOfGravity.y}, ${result.centerOfGravity.z})`);

if (result.warnings.length > 0) {
  console.log('Warnings:');
  result.warnings.forEach(w => console.log(`  - ${w}`));
}
```

---

## Multi-Stop Delivery Validation

Check if items are loaded in the right order for unloading.

```typescript
import { ConstraintValidator } from '@sjlouji/project-fit';

const itemsMap = new Map(items.map(i => [i.id, i]));
const validation = ConstraintValidator.validateDeliveryOrderSequence(
  result.packedItems,
  itemsMap
);

if (validation.valid) {
  console.log('✓ Can unload in delivery order');
} else {
  console.log('✗ Need to rearrange:');
  validation.violations.forEach(v => {
    console.log(`  ${v.message}`);
  });
}
```

---

## Common Patterns

### Packing with Fragile Items

```typescript
const items = [
  {
    id: 'GLASS',
    type: 'carton',
    length: 30, width: 30, height: 30,
    weight: 5,
    quantity: 10,
    stackable: false,    // Can't stack
    fragile: true,       // Nothing goes on top
    loadBearing: false,
    rotationAllowed: [],
    priority: 1,
    deliveryStop: 1
  }
];

const result = packItems(container, items);
// Items placed individually with no weight on top
```

### Multi-Stop Route

```typescript
const multiStopItems = [
  { id: 'STOP1', deliveryStop: 1, ... },
  { id: 'STOP2', deliveryStop: 2, ... },
  { id: 'STOP3', deliveryStop: 3, ... }
];

const result = packItems(container, multiStopItems);
const validation = ConstraintValidator.validateDeliveryOrderSequence(
  result.packedItems,
  new Map(multiStopItems.map(i => [i.id, i]))
);

if (!validation.valid) {
  console.log('Rearrange items before unloading');
}
```

### Different Item Types

```typescript
const items = [
  { id: 'PALLET', type: 'pallet', length: 120, ... },
  { id: 'BOX', type: 'carton', length: 60, ... },
  { id: 'DRUM', type: 'drum', length: 90, ... }
];

const result = packItems(container, items);
// Handles all types automatically
```
