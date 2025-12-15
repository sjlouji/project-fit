# Algorithms & Logics

## Overview

Project Fit uses the **Extreme Point Heuristic** algorithm to solve 3D bin packing. This approach is computationally efficient while producing high-quality packing solutions for real-world logistics scenarios.

## Extreme Point Heuristic

### What is an Extreme Point?

An extreme point is a 3D coordinate in the container where new items can potentially be placed. The algorithm maintains a list of extreme points that represent "frontiers" in the packing space.

As items are placed, new extreme points are generated at their edges and vertices. This allows the algorithm to intelligently explore placement candidates without checking every possible coordinate.

### Algorithm Steps

1. **Initialization**
   - Start with a single extreme point at container origin (0, 0, 0)
   - Sort items by volume (largest first) and priority (higher priority = lower number)

2. **For Each Item**
   - For each quantity of the item:
     - Try all extreme points as candidate positions
     - For each candidate position, try all allowed rotations
     - Validate placement against all constraints
     - Select best placement (lowest Z, then X, then Y for stable stacking)
     - If placeable:
       - Add placed item to result
       - Generate new extreme points from item edges
     - Else:
       - Mark item as unpacked

3. **Return Results**
   - Packing metrics
   - List of placed items with positions and dimensions
   - List of unpacked items

### Time Complexity

- **Space**: O(n) where n = number of items
- **Time**: O(n² × m) where m = number of extreme points (typically < 100 points, milliseconds for standard truck loads)

### Why Extreme Point?

- **Fast**: Suitable for real-time logistics decisions
- **Effective**: Produces good utilization rates (80%+ for typical scenarios)
- **Practical**: Easy to implement and understand
- **Extensible**: Works well with various constraint types

## Physics-Based Constraints

Project Fit enforces real-world physics constraints to ensure packing is not just space-efficient, but also safe and practical.

### 1. Container Bounds

Items must fit entirely within the container dimensions.

```
Validation: item.x + item.width ≤ container.width
           item.y + item.length ≤ container.length
           item.z + item.height ≤ container.height
```

### 2. Overlap Detection

No two items can occupy the same space. Uses AABB (Axis-Aligned Bounding Box) collision detection.

```
No overlap if:
  boxA.maxX < boxB.minX  OR
  boxA.maxY < boxB.minY  OR
  boxA.maxZ < boxB.minZ
```

### 3. Weight Limits

Total weight cannot exceed container capacity.

```
Validation: Σ(items weight) ≤ container.maxWeight
```

### 4. Stackability Rules

Items can only be stacked on items that are stackable. Each stackable item has a maximum stack weight limit.

```
When placing item A on item B:
  - Item B must have stackable = true
  - Weight on top of B + A.weight ≤ B.maxStackWeight
```

**Example**: A carton with `maxStackWeight: 500` can support up to 500kg of weight on top.

### 5. Fragile Item Protection

Fragile items cannot have weight placed on top of them. This prevents breakage during transport.

```
If item.fragile = true:
  Weight above item = 0
```

### 6. Load Bearing Capacity

Items with `loadBearing: false` cannot support weight on top. Common for certain packaging types.

```
If item.loadBearing = false:
  Weight above item = 0
```

### 7. Center of Gravity Stability

High stacks must remain close to the container's center to prevent tipping during transport.

```
For items at Z > 150cm:
  distance from center ≤ 300cm

  distance = √[(itemCenterX - containerCenterX)² + (itemCenterY - containerCenterY)²]
```

This constraint prevents top-heavy loads that could destabilize the vehicle.

## Item Rotation

Items can be rotated along different axes to find better fit. Three rotation axes are supported:

- **XY**: Rotate around Z axis (swap length/width)
- **XZ**: Rotate around Y axis (swap length/height)
- **YZ**: Rotate around X axis (swap width/height)

Each item specifies which rotations are allowed via `rotationAllowed` array.

```typescript
rotationAllowed: ['xy', 'xz']  // Can rotate on XY and XZ planes

// Dimension transformations:
// Original: length=100, width=80, height=60
// After XY:  length=80,  width=100, height=60
// After XZ:  length=60,  width=80,  height=100
```

## Multi-Stop Delivery Order

### LIFO (Last In, First Out) Principle

For multi-stop delivery routes, items must be unloaded in reverse order of loading. Project Fit validates that items for earlier stops are positioned higher (greater Z coordinate) than items for later stops.

### Validation Logic

1. Group placed items by delivery stop
2. Calculate average Z height for each stop
3. For consecutive stops, verify: `avgZ(stop_n) > avgZ(stop_n+1)`

If violations exist, items must be repositioned before unloading to avoid moving already-unloaded cargo.

**Example**:
- Stop 1 items must be above Stop 2 items
- Stop 2 items must be above Stop 3 items
- Allows unloading in sequence: Stop 1 → Stop 2 → Stop 3

## Performance Considerations

### Optimization Techniques

1. **Item Sorting**: Larger items first reduces fragmentation
2. **Priority Handling**: High-priority items placed preferentially
3. **Extreme Point Management**: Limits extreme points to prevent exponential growth
4. **Early Termination**: Stops trying rotations once a valid placement found

### Typical Performance

- **100 items**: < 50ms
- **1000 items**: 100-200ms
- **10000 items**: 1-2 seconds

Performance scales well for practical logistics scenarios.

## Metrics Explained

### Volume Utilization

```
Utilization% = (Σ item volumes / Container volume) × 100
```

Measures how much of the container space is actually filled. Higher is better, but 100% is rarely achievable due to shape constraints.

### Weight Utilization

```
Weight Utilization% = (Total weight / Container max weight) × 100
```

Indicates how fully the weight capacity is used. Important for transportation cost optimization.

### Center of Gravity

Calculated as the weighted average position of all placed items:

```
CoG.x = Σ(item.weight × item.centerX) / Σ(item.weight)
CoG.y = Σ(item.weight × item.centerY) / Σ(item.weight)
CoG.z = Σ(item.weight × item.centerZ) / Σ(item.weight)
```

Lower Z values indicate more stable loading. For transportation safety, CoG should be centered horizontally.
