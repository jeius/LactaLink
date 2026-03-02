export const INVENTORY_STATUS = {
  AVAILABLE: { label: 'Available', value: 'AVAILABLE' },
  RESERVED: { label: 'Reserved', value: 'RESERVED' },
  EXPIRED: { label: 'Expired', value: 'EXPIRED' },
  CONSUMED: { label: 'Consumed', value: 'CONSUMED' },
} as const;

export const INVENTORY_ALLOCATION_STATUS = {
  PENDING: { label: 'Pending', value: 'PENDING' },
  FULFILLED: { label: 'Fulfilled', value: 'FULFILLED' },
  CANCELLED: { label: 'Cancelled', value: 'CANCELLED' },
} as const;
