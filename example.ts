/**
 * Example: Using the Project Fit 3D Bin Packing Algorithm
 *
 * This example demonstrates how to use the algorithm to pack items into a truck container
 */

import { packItems, Container, Item } from './src/index';

// Define the truck container
const container: Container = {
  id: 'TRUCK-001',
  length: 1360,
  width: 240,
  height: 270,
  maxWeight: 24000,
  unit: 'cm',
  weightUnit: 'kg'
};

// Define items to pack
const items: Item[] = [
  {
    id: 'CARTON-A',
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
    priority: 2,
    deliveryStop: 1
  },
  {
    id: 'PALLET-B',
    type: 'pallet',
    length: 120,
    width: 80,
    height: 15,
    weight: 25,
    quantity: 5,
    stackable: false,
    maxStackWeight: 1000,
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy'],
    priority: 1,
    deliveryStop: 2
  },
  {
    id: 'CARTON-C',
    type: 'carton',
    length: 100,
    width: 50,
    height: 50,
    weight: 30,
    quantity: 10,
    stackable: true,
    maxStackWeight: 300,
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy', 'xz', 'yz'],
    priority: 3,
    deliveryStop: 1
  }
];

// Run the packing algorithm
console.log('🚚 Starting 3D Bin Packing Algorithm...\n');
const result = packItems(container, items);

// Display results
console.log('📊 PACKING RESULTS');
console.log('==================\n');

console.log(`Container ID: ${result.containerId}`);
console.log(`Total Items to Pack: ${items.reduce((sum, i) => sum + i.quantity, 0)}`);
console.log(`Items Packed: ${result.itemsPacked}`);
console.log(`Items Unpacked: ${result.itemsUnpacked}`);

if (result.unpackedItems.length > 0) {
  console.log(`\nUnpacked Items:`);
  result.unpackedItems.forEach(item => console.log(`  - ${item}`));
}

console.log(`\n📈 METRICS`);
console.log('===========');
console.log(`Volume Efficiency: ${result.metrics.volumeEfficiency.toFixed(2)}%`);
console.log(`Weight Efficiency: ${result.metrics.weightEfficiency.toFixed(2)}%`);
console.log(`Total Weight: ${result.totalWeight} kg / ${container.maxWeight} kg`);
console.log(`Computation Time: ${result.computationTimeMs}ms`);

console.log(`\n⚖️ CENTER OF GRAVITY`);
console.log('====================');
const cog = result.centerOfGravity;
console.log(`X: ${cog.x.toFixed(2)} cm`);
console.log(`Y: ${cog.y.toFixed(2)} cm`);
console.log(`Z: ${cog.z.toFixed(2)} cm`);

if (result.warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS`);
  console.log('============');
  result.warnings.forEach(warning => console.log(`  - ${warning}`));
}

console.log(`\n✅ PLACED ITEMS (First 10)`);
console.log('==========================');
result.packedItems.slice(0, 10).forEach((item, index) => {
  console.log(`${index + 1}. ${item.itemId} (instance ${item.instanceIndex})`);
  console.log(`   Position: (${item.position.x}, ${item.position.y}, ${item.position.z})`);
  console.log(`   Dimensions: ${item.dimensionsPlaced.length} × ${item.dimensionsPlaced.width} × ${item.dimensionsPlaced.height} cm`);
});

if (result.packedItems.length > 10) {
  console.log(`\n... and ${result.packedItems.length - 10} more items`);
}

console.log('\n🎉 Packing complete!');
