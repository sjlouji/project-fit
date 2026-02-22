import { packItems } from '../src/index';
import { eCommerceContainer, eCommerceItems } from './e-commerce-warehouse';
import { manufacturingContainer, manufacturingItems } from './manufacturing-logistics';
import { foodBeverageContainer, foodBeverageItems } from './food-beverage-distribution';

function getPackingResultSummary(label: string, result: any) {
  const itemsByType: Record<string, number> = {};
  result.packedItems.forEach((item: any) => {
    const itemId = item.itemId.split('-')[0];
    itemsByType[itemId] = (itemsByType[itemId] || 0) + 1;
  });

  return {
    label,
    containerId: result.containerId,
    itemsPacked: result.itemsPacked,
    itemsUnpacked: result.itemsUnpacked,
    volumeUtilization: result.utilizationPct,
    weightUtilization: ((result.totalWeight / 28000) * 100),
    totalWeight: result.totalWeight,
    computationTime: result.computationTimeMs,
    centerOfGravity: result.centerOfGravity,
    warnings: result.warnings || [],
    unpackedItems: result.unpackedItems || [],
    itemsByType
  };
}

export function runIntegrationExamples() {
  const eCommerceResult = packItems(eCommerceContainer, eCommerceItems);
  const eCommerceSummary = getPackingResultSummary('E-Commerce Warehouse Load', eCommerceResult);

  const manufacturingResult = packItems(manufacturingContainer, manufacturingItems);
  const manufacturingSummary = getPackingResultSummary('Manufacturing Logistics Load', manufacturingResult);

  const foodResult = packItems(foodBeverageContainer, foodBeverageItems);
  const foodSummary = getPackingResultSummary('Food & Beverage Distribution Load', foodResult);

  return {
    eCommerce: eCommerceSummary,
    manufacturing: manufacturingSummary,
    foodBeverage: foodSummary
  };
}
