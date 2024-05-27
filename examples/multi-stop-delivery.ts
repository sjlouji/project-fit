import { packItems, Container, Item } from '../src/index';
import { ConstraintValidator } from '../src/algorithm/constraints';

const deliveryTruck: Container = {
  id: 'DELIVERY-TRUCK-MULTI-STOP',
  length: 1200,
  width: 234,
  height: 235,
  maxWeight: 28000,
  unit: 'cm',
  weightUnit: 'kg'
};

const multiStopItems: Item[] = [
  {
    id: 'STOP-1-WAREHOUSE-A',
    type: 'carton',
    length: 100,
    width: 100,
    height: 80,
    weight: 80,
    quantity: 12,
    stackable: true,
    maxStackWeight: 800,
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy'],
    priority: 3,
    deliveryStop: 1
  },
  {
    id: 'STOP-2-WAREHOUSE-B',
    type: 'carton',
    length: 90,
    width: 90,
    height: 80,
    weight: 70,
    quantity: 15,
    stackable: true,
    maxStackWeight: 700,
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy'],
    priority: 2,
    deliveryStop: 2
  },
  {
    id: 'STOP-3-WAREHOUSE-C',
    type: 'pallet',
    length: 120,
    width: 80,
    height: 140,
    weight: 400,
    quantity: 3,
    stackable: true,
    maxStackWeight: 1600,
    fragile: false,
    loadBearing: true,
    rotationAllowed: [],
    priority: 1,
    deliveryStop: 3
  },
  {
    id: 'STOP-4-WAREHOUSE-D',
    type: 'carton',
    length: 80,
    width: 80,
    height: 70,
    weight: 60,
    quantity: 20,
    stackable: true,
    maxStackWeight: 600,
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy', 'xz'],
    priority: 4,
    deliveryStop: 4
  }
];

function analyzeDeliveryOrder(label: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`  ${label}`);
  console.log(`${'='.repeat(80)}\n`);

  const result = packItems(deliveryTruck, multiStopItems);
  const itemsMap = new Map(multiStopItems.map(item => [item.id, item]));

  console.log(`📦 PACKING RESULTS:`);
  console.log(`   Items Packed: ${result.itemsPacked}/${result.itemsPacked + result.itemsUnpacked}`);
  console.log(`   Volume Utilization: ${result.utilizationPct.toFixed(2)}%`);
  console.log(`   Weight Utilization: ${((result.totalWeight / deliveryTruck.maxWeight) * 100).toFixed(2)}%`);
  console.log(`   Total Weight: ${result.totalWeight}kg`);
  console.log(`   Computation Time: ${result.computationTimeMs}ms\n`);

  console.log(`📍 DELIVERY STOP BREAKDOWN:`);

  const stopGroups = new Map<number, any[]>();

  for (const placed of result.packedItems) {
    const item = multiStopItems.find(i => i.id === placed.itemId);
    if (!item) continue;

    if (!stopGroups.has(item.deliveryStop)) {
      stopGroups.set(item.deliveryStop, []);
    }
    stopGroups.get(item.deliveryStop)!.push({
      placed,
      item
    });
  }

  const stops = Array.from(stopGroups.keys()).sort((a, b) => a - b);

  for (const stop of stops) {
    const items = stopGroups.get(stop)!;
    const totalWeight = items.reduce((sum, i) => sum + i.placed.weight, 0);
    const minZ = Math.min(...items.map(i => i.placed.position.z));
    const maxZ = Math.max(
      ...items.map(i => i.placed.position.z + i.placed.dimensionsPlaced.height)
    );
    const avgZ = items.reduce((sum, i) => sum + i.placed.position.z, 0) / items.length;

    console.log(`   Stop ${stop}:`);
    console.log(`      Items: ${items.length} units`);
    console.log(`      Weight: ${totalWeight}kg`);
    console.log(`      Height Range: ${minZ.toFixed(0)}cm - ${maxZ.toFixed(0)}cm`);
    console.log(`      Average Z: ${avgZ.toFixed(0)}cm`);

    items.forEach(({ item: itemType, placed }) => {
      console.log(`        • ${itemType.id}: 1 unit @ Z=${placed.position.z.toFixed(0)}cm`);
    });
  }

  console.log(`\n⚠️ DELIVERY ORDER VALIDATION:`);

  const validation = ConstraintValidator.validateDeliveryOrderSequence(
    result.packedItems,
    itemsMap
  );

  console.log(`   Status: ${validation.valid ? '✅ LIFO COMPLIANT' : '❌ VIOLATIONS DETECTED'}`);
  console.log(`   ${validation.summary}\n`);

  if (validation.violations.length > 0) {
    console.log(`   Violations:`);
    validation.violations.forEach(violation => {
      console.log(`      • ${violation.message}`);
    });
  }

  console.log(`\n📊 UNLOADING SEQUENCE:`);

  if (validation.valid) {
    console.log(`   You can unload stops in order (1 → 2 → 3 → 4) without moving other cargo:`);
    stops.forEach(stop => {
      const items = stopGroups.get(stop)!;
      const unloadIds = items.map(i => i.item.id).join(', ');
      console.log(`      Stop ${stop}: Unload ${unloadIds}`);
    });
  } else {
    console.log(`   ⚠️ Reposition items before unloading to maintain LIFO order.`);
    console.log(`   Affected stops: ${validation.violations.map(v => `Stop ${v.stop1} → Stop ${v.stop2}`).join(', ')}`);
  }

  console.log(`\n⚖️ CENTER OF GRAVITY:`);
  console.log(`   X: ${result.centerOfGravity.x.toFixed(0)}cm`);
  console.log(`   Y: ${result.centerOfGravity.y.toFixed(0)}cm`);
  console.log(`   Z: ${result.centerOfGravity.z.toFixed(0)}cm`);

  const cogDistance = Math.sqrt(
    Math.pow(result.centerOfGravity.x - deliveryTruck.length / 2, 2) +
    Math.pow(result.centerOfGravity.y - deliveryTruck.width / 2, 2)
  );

  console.log(`   Distance from center: ${cogDistance.toFixed(0)}cm`);
  console.log(`   Stability: ${cogDistance < 200 ? '✅ Excellent' : cogDistance < 300 ? '⚠️ Good' : '❌ Poor'}\n`);

  return {
    result,
    validation,
    stopGroups
  };
}

function main() {
  console.log(`\n${'#'.repeat(80)}`);
  console.log('#' + ' '.repeat(78) + '#');
  console.log('#  Project Fit - Multi-Stop Delivery Route Optimization' + ' '.repeat(25) + '#');
  console.log('#' + ' '.repeat(78) + '#');
  console.log(`${'#'.repeat(80)}\n`);

  console.log('This example demonstrates optimal packing for a multi-stop delivery route.');
  console.log('The algorithm ensures LIFO (Last In, First Out) compliance whenever possible,');
  console.log('allowing stops to be unloaded in sequence without moving other cargo.\n');

  const { result, validation, stopGroups } = analyzeDeliveryOrder(
    'Multi-Stop Delivery Route Optimization'
  );

  console.log(`${'='.repeat(80)}`);
  console.log(`  ROUTE OPTIMIZATION SUMMARY`);
  console.log(`${'='.repeat(80)}\n`);

  console.log('Key Metrics:');
  const stops = Array.from(stopGroups.keys()).sort((a, b) => a - b);
  console.log(
    `  • Total Stops: ${stops.length}`
  );
  console.log(`  • Items Packed: ${result.itemsPacked}`);
  console.log(`  • LIFO Compliant: ${validation.valid ? 'Yes ✅' : 'No ❌'}`);
  console.log(`  • Packing Efficiency: ${result.utilizationPct.toFixed(1)}%`);
  console.log(`  • Weight Efficiency: ${((result.totalWeight / deliveryTruck.maxWeight) * 100).toFixed(1)}%\n`);

  console.log('Recommendations:');

  if (validation.valid) {
    console.log('  ✅ Current load is LIFO compliant.');
    console.log('  • Unload stops in sequential order without rearranging cargo.');
    console.log('  • Load was optimized for maximum accessibility.\n');
  } else {
    console.log('  ⚠️ Current load has LIFO violations.');
    console.log('  • Before unloading, reposition blocking items temporarily.');
    console.log(`  • Affected route segments: ${validation.violations.map(v => `${v.stop1}→${v.stop2}`).join(', ')}\n`);

    validation.violations.forEach(violation => {
      console.log(`  Action: Stop ${violation.stop1} (at ${violation.stop1AvgZ.toFixed(0)}cm) must be repositioned`);
      console.log(
        `         above Stop ${violation.stop2} (at ${violation.stop2AvgZ.toFixed(0)}cm) before unloading.\n`
      );
    });
  }

  console.log('Performance:');
  console.log(`  • Packing computed in ${result.computationTimeMs}ms`);
  console.log(`  • Route can be executed in ${stops.length} stops\n`);

  console.log(`${'#'.repeat(80)}\n`);
}

main();
