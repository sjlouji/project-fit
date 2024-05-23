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

export function analyzeMultiStopDelivery() {
  const result = packItems(deliveryTruck, multiStopItems);
  const itemsMap = new Map(multiStopItems.map(item => [item.id, item]));

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

  const stopDetails = stops.map(stop => {
    const items = stopGroups.get(stop)!;
    const totalWeight = items.reduce((sum, i) => sum + i.placed.weight, 0);
    const minZ = Math.min(...items.map(i => i.placed.position.z));
    const maxZ = Math.max(
      ...items.map(i => i.placed.position.z + i.placed.dimensionsPlaced.height)
    );
    const avgZ = items.reduce((sum, i) => sum + i.placed.position.z, 0) / items.length;

    return {
      stop,
      itemCount: items.length,
      totalWeight,
      minZ,
      maxZ,
      avgZ,
      items: items.map(({ item: itemType }) => itemType.id)
    };
  });

  const validation = ConstraintValidator.validateDeliveryOrderSequence(
    result.packedItems,
    itemsMap
  );

  const cogDistance = Math.sqrt(
    Math.pow(result.centerOfGravity.x - deliveryTruck.length / 2, 2) +
    Math.pow(result.centerOfGravity.y - deliveryTruck.width / 2, 2)
  );

  return {
    containerId: deliveryTruck.id,
    packing: {
      itemsPacked: result.itemsPacked,
      itemsUnpacked: result.itemsUnpacked,
      volumeUtilization: result.utilizationPct,
      weightUtilization: ((result.totalWeight / deliveryTruck.maxWeight) * 100),
      totalWeight: result.totalWeight,
      computationTime: result.computationTimeMs
    },
    stops: stopDetails,
    validation: {
      isValid: validation.valid,
      summary: validation.summary,
      violations: validation.violations
    },
    centerOfGravity: {
      x: result.centerOfGravity.x,
      y: result.centerOfGravity.y,
      z: result.centerOfGravity.z,
      distanceFromCenter: cogDistance
    }
  };
}
