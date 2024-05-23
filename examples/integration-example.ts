import { packItems } from '../src/index';
import { eCommerceContainer, eCommerceItems } from './e-commerce-warehouse';
import { manufacturingContainer, manufacturingItems } from './manufacturing-logistics';
import { foodBeverageContainer, foodBeverageItems } from './food-beverage-distribution';

function formatPackingResult(label: string, result: any) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${label}`);
  console.log(`${'='.repeat(70)}`);

  console.log(`\nContainer: ${result.containerId}`);
  console.log(`Items Packed: ${result.itemsPacked} / ${result.itemsPacked + result.itemsUnpacked}`);
  console.log(`Volume Utilization: ${result.utilizationPct.toFixed(2)}%`);
  console.log(`Weight Utilization: ${((result.totalWeight / 28000) * 100).toFixed(2)}%`);
  console.log(`Total Weight: ${result.totalWeight}kg`);
  console.log(`Computation Time: ${result.computationTimeMs}ms`);

  if (result.centerOfGravity) {
    console.log(`\nCenter of Gravity:`);
    console.log(`  X: ${result.centerOfGravity.x.toFixed(0)}cm`);
    console.log(`  Y: ${result.centerOfGravity.y.toFixed(0)}cm`);
    console.log(`  Z: ${result.centerOfGravity.z.toFixed(0)}cm`);
  }

  if (result.warnings && result.warnings.length > 0) {
    console.log(`\nWarnings:`);
    result.warnings.forEach((w: string) => {
      console.log(`  ⚠️  ${w}`);
    });
  }

  if (result.itemsUnpacked > 0) {
    console.log(`\nUnpacked Items:`);
    result.unpackedItems.forEach((item: string) => {
      console.log(`  • ${item}`);
    });
  }

  console.log(`\nPlaced Items Summary:`);
  const itemsByType: Record<string, number> = {};
  result.packedItems.forEach((item: any) => {
    const itemId = item.itemId.split('-')[0];
    itemsByType[itemId] = (itemsByType[itemId] || 0) + 1;
  });

  Object.entries(itemsByType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} units`);
  });
}

function runIntegrationExamples() {
  console.log(`\n${'#'.repeat(70)}`);
  console.log('#' + ' '.repeat(68) + '#');
  console.log('#  Project Fit - Integration Examples' + ' '.repeat(33) + '#');
  console.log('#' + ' '.repeat(68) + '#');
  console.log(`${'#'.repeat(70)}\n`);

  // Example 1: E-commerce Warehouse
  console.log('Running Example 1: E-commerce Warehouse Distribution');
  const eCommerceResult = packItems(eCommerceContainer, eCommerceItems);
  formatPackingResult('E-Commerce Warehouse Load', eCommerceResult);

  // Example 2: Manufacturing Logistics
  console.log('\n\nRunning Example 2: Manufacturing Logistics');
  const manufacturingResult = packItems(manufacturingContainer, manufacturingItems);
  formatPackingResult('Manufacturing Logistics Load', manufacturingResult);

  // Example 3: Food & Beverage Distribution
  console.log('\n\nRunning Example 3: Food & Beverage Distribution');
  const foodResult = packItems(foodBeverageContainer, foodBeverageItems);
  formatPackingResult('Food & Beverage Distribution Load', foodResult);

  // Summary Comparison
  console.log(`\n${'='.repeat(70)}`);
  console.log('  COMPARISON SUMMARY');
  console.log(`${'='.repeat(70)}\n`);

  const results = [
    { name: 'E-Commerce', result: eCommerceResult },
    { name: 'Manufacturing', result: manufacturingResult },
    { name: 'Food & Beverage', result: foodResult }
  ];

  console.log('Scenario            | Packing Rate | Volume Util | Weight Util | Time (ms)');
  console.log('-'.repeat(80));

  results.forEach(({ name, result }) => {
    const packingRate = ((result.itemsPacked / (result.itemsPacked + result.itemsUnpacked)) * 100).toFixed(1);
    const weightUtil = ((result.totalWeight / 28000) * 100).toFixed(1);
    const volumeUtil = result.utilizationPct.toFixed(1);
    const time = result.computationTimeMs;

    console.log(
      `${name.padEnd(20)}| ${packingRate}% ${' '.repeat(9)}| ${volumeUtil}% ${' '.repeat(9)}| ${weightUtil}% ${' '.repeat(9)}| ${time}`
    );
  });

  console.log(`\n${'#'.repeat(70)}\n`);
}

runIntegrationExamples();
