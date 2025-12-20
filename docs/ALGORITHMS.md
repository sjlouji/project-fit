# How It Works

## The Packing Algorithm

Project Fit uses an "Extreme Point" algorithm. Here's the basic idea:

1. **Start with an empty space** — The container begins at position (0, 0, 0)
2. **For each item to pack:**
   - Try placing it at different spots
   - Try different rotations
   - Check if it fits (doesn't overlap, doesn't exceed limits, respects rules)
   - Pick the best placement (lowest position, then closest to left/front)
   - Add it to the packed list
   - Mark new possible placement positions
3. **Return results** — All packed items, metrics, and unpacked items

**Why "Extreme Point"?**

As you place items, you create edges and corners. The algorithm remembers these as potential spots for the next item. This is much faster than checking every possible coordinate in the container.

**Speed:** Typical truck load (100-1000 items) in 50-200 milliseconds.

## Constraints (The Rules)

The algorithm enforces real-world physics rules so your packing is actually safe and practical.

### 1. Fit in Container

Items must fit completely inside:
```
item.x + item.width ≤ container.width
item.y + item.length ≤ container.length
item.z + item.height ≤ container.height
```

### 2. No Overlapping

Items can't occupy the same space. The algorithm checks bounding boxes for collisions.

### 3. Weight Limits

Total weight can't exceed container capacity:
```
sum of all items ≤ container.maxWeight
```

### 4. Stackability

Items can only stack on other items that allow stacking. Each stackable item has a weight limit for what can sit on top:

```
When stacking item A on item B:
  - B must have stackable: true
  - Total weight on B ≤ B.maxStackWeight
```

**Example:** A box marked `maxStackWeight: 500` can support 500kg of other boxes on top of it. If you try to add 600kg, it fails.

### 5. Fragile Items

Fragile items (breakable stuff) can't have anything placed on top. This protects them during transport.

```
If fragile: true → nothing can go above it
```

### 6. Load Bearing

Some items can't support weight on top (like certain packaging materials). The algorithm prevents stacking on these.

```
If loadBearing: false → nothing can go above it
```

### 7. Stability

Heavy stacks can't be too far from the container center (prevents tipping).

```
For items stacked high (Z > 150cm):
  distance from center ≤ 300cm
```

This keeps the truck balanced and safe while driving.

## Rotating Items

Items can rotate to fit better. Three rotation types:

- **xy** — Spin around height (swap width & length)
- **xz** — Spin around depth (swap width & height)
- **yz** — Spin around width (swap length & height)

Each item specifies which rotations are allowed. Some items (like pallets) can't rotate at all.

## Multi-Stop Delivery (LIFO)

For multi-stop routes, items must unload in reverse order.

**Example:** If you're delivering to Stop 1, 2, 3 (in that order):
- Stop 1 items should be on top (unload first)
- Stop 3 items on bottom (unload last)

The algorithm checks this and reports violations if items aren't in the right order.

## Understanding the Results

### Utilization %

How much space you actually used:
```
Utilization = (items volume / container volume) × 100
```

Higher is better, but 100% is impossible due to shapes and rotation limits.

### Weight Used %

How full you are by weight:
```
Weight % = (total weight / max weight) × 100
```

Shows if you're using weight capacity efficiently.

### Center of Gravity (CoG)

The average position of all items (weighted by their weight). For safety:
- **Low Z** = stable (less likely to tip)
- **Centered X/Y** = balanced

The algorithm calculates this for all items combined.

## Performance

The algorithm scales well:
- 100 items: < 50ms
- 1,000 items: 100-200ms
- 10,000 items: 1-2 seconds

Good enough for real-time decisions in logistics.
