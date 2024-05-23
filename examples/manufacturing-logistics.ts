import { Container, Item } from '../src/models';

export const manufacturingContainer: Container = {
  id: 'MANUFACTURING-TRUCK-001',
  length: 1200,
  width: 234,
  height: 235,
  maxWeight: 28000,
  unit: 'cm',
  weightUnit: 'kg'
};

export const manufacturingItems: Item[] = [
  {
    id: 'DRUM-MOTOR-OIL',
    type: 'drum',
    length: 85,
    width: 85,
    height: 110,
    weight: 180,
    quantity: 12,
    stackable: true,
    maxStackWeight: 540,
    fragile: false,
    loadBearing: true,
    rotationAllowed: [],
    priority: 1,
    deliveryStop: 1
  },
  {
    id: 'CRATE-METAL-PARTS',
    type: 'crate',
    length: 100,
    width: 80,
    height: 90,
    weight: 350,
    quantity: 6,
    stackable: true,
    maxStackWeight: 1400,
    fragile: false,
    loadBearing: true,
    rotationAllowed: [],
    priority: 2,
    deliveryStop: 1
  },
  {
    id: 'CARTON-FASTENERS',
    type: 'carton',
    length: 60,
    width: 40,
    height: 40,
    weight: 35,
    quantity: 30,
    stackable: true,
    maxStackWeight: 500,
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy', 'xz'],
    priority: 3,
    deliveryStop: 1
  },
  {
    id: 'CARTON-ASSEMBLY-KIT',
    type: 'carton',
    length: 80,
    width: 60,
    height: 50,
    weight: 45,
    quantity: 20,
    stackable: true,
    maxStackWeight: 400,
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy'],
    priority: 3,
    deliveryStop: 2
  },
  {
    id: 'CARTON-CIRCUIT-BOARDS',
    type: 'carton',
    length: 45,
    width: 35,
    height: 30,
    weight: 18,
    quantity: 25,
    stackable: true,
    maxStackWeight: 200,
    fragile: true,
    loadBearing: false,
    rotationAllowed: ['xy'],
    priority: 1,
    deliveryStop: 1
  }
];
