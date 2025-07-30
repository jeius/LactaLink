export const TRANSACTION_STATUS = {
  MATCHED: { label: 'Matched', value: 'MATCHED' },
  PENDING_DELIVERY_CONFIRMATION: {
    label: 'Pending Delivery Confirmation',
    value: 'PENDING_DELIVERY_CONFIRMATION',
  },
  DELIVERY_SCHEDULED: { label: 'Delivery Scheduled', value: 'DELIVERY_SCHEDULED' },
  IN_TRANSIT: { label: 'In Transit', value: 'IN_TRANSIT' },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
  DELIVERED: { label: 'Delivered', value: 'DELIVERED' },
  COMPLETED: { label: 'Completed', value: 'COMPLETED' },
  FAILED: { label: 'Failed', value: 'FAILED' },
  CANCELLED: { label: 'Cancelled', value: 'CANCELLED' },
} as const;

export const TRANSACTION_TYPE = {
  P2P: { label: 'Peer to Peer', value: 'P2P' },
  P2O: { label: 'Peer to Organization', value: 'P2O' },
  O2P: { label: 'Organization to Peer', value: 'O2P' },
} as const;

export const TRANSACTION_PROPOSED_BY = {
  DONOR: { label: 'Donor', value: 'DONOR' },
  REQUESTER: { label: 'Requester', value: 'REQUESTER' },
} as const;

export const TIME_SLOT_TYPES = {
  CUSTOM: { label: 'Custom', value: 'CUSTOM' },
  PRESET: { label: 'Preset', value: 'PRESET' },
} as const;

export const TIME_SLOTS = {
  '08:00-10:00': { label: '8:00 AM - 10:00 AM', value: '08:00-10:00' },
  '10:00-12:00': { label: '10:00 AM - 12:00 PM', value: '10:00-12:00' },
  '12:00-14:00': { label: '12:00 PM - 2:00 PM', value: '12:00-14:00' },
  '14:00-16:00': { label: '2:00 PM - 4:00 PM', value: '14:00-16:00' },
  '16:00-18:00': { label: '4:00 PM - 6:00 PM', value: '16:00-18:00' },
  '18:00-20:00': { label: '6:00 PM - 8:00 PM', value: '18:00-20:00' },
} as const;
