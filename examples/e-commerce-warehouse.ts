import { Container, Item } from '../src/models';

export const eCommerceContainer: Container = {
  id: 'WAREHOUSE-TRUCK-001',
  length: 1200,
  width: 234,
  height: 235,
  maxWeight: 28000,
  unit: 'cm',
  weightUnit: 'kg'
};

export const eCommerceItems: Item[] = [
  {
    id: 'PALLET-HOUSEHOLD',
    type: 'pallet',
    length: 120,
    width: 80,
    height: 150,
    weight: 500,
    quantity: 8,
    stackable: true,
    maxStackWeight: 2000,
    fragile: false,
    loadBearing: true,
    rotationAllowed: [],
    priority: 1,
    deliveryStop: 1
  },
  {
    id: 'CARTON-BOOKS',
    type: 'carton',
    length: 60,
    width: 40,
    height: 35,
    weight: 25,
    quantity: 40,
    stackable: true,
    maxStackWeight: 500,
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy', 'xz'],
    priority: 3,
    deliveryStop: 1
  },
  {
    id: 'CARTON-ELECTRONICS',
    type: 'carton',
    length: 50,
    width: 45,
    height: 40,
    weight: 30,
    quantity: 25,
    stackable: true,
    maxStackWeight: 300,
    fragile: true,
    loadBearing: false,
    rotationAllowed: ['xy'],
    priority: 1,
    deliveryStop: 1
  },
  {
    id: 'CARTON-CLOTHING',
    type: 'carton',
    length: 55,
    width: 40,
    height: 40,
    weight: 12,
    quantity: 70,
    stackable: true,
    maxStackWeight: 400,
    fragile: false,
    loadBearing: true,
    rotationAllowed: ['xy', 'xz', 'yz'],
    priority: 4,
    deliveryStop: 2
  },
  {
    id: 'CARTON-GLASSWARE',
    type: 'carton',
    length: 40,
    width: 40,
    height: 35,
    weight: 20,
    quantity: 15,
    stackable: false,
    maxStackWeight: 0,
    fragile: true,
    loadBearing: false,
    rotationAllowed: ['xy'],
    priority: 1,
    deliveryStop: 1
  }
];
