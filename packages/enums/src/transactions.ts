export const TRANSACTION_STATUS = {
  PENDING: {
    label: 'Waiting Confirmation',
    value: 'PENDING',
  },
  CONFIRMED: { label: 'Delivery Confirmed', value: 'CONFIRMED' },
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
  O2O: { label: 'Organization to Organization', value: 'O2O' },
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

export const DELIVERY_PROPOSAL_STATUS = {
  PENDING: { label: 'Pending', value: 'PENDING' },
  ACCEPTED: { label: 'Accepted', value: 'ACCEPTED' },
  REJECTED: { label: 'Rejected', value: 'REJECTED' },
  SUPERSEDED: { label: 'Superseded', value: 'SUPERSEDED' },
} as const;

export const TRANSACTION_EVENT_TYPES = {
  TRANSACTION_CREATED: { label: 'Transaction Created', value: 'TRANSACTION_CREATED' },
  DELIVERY_PROPOSED: { label: 'Delivery Proposed', value: 'DELIVERY_PROPOSED' },
  PROPOSAL_ACCEPTED: { label: 'Proposal Accepted', value: 'PROPOSAL_ACCEPTED' },
  PROPOSAL_REJECTED: { label: 'Proposal Rejected', value: 'PROPOSAL_REJECTED' },
  DELIVERY_SCHEDULED: { label: 'Delivery Scheduled', value: 'DELIVERY_SCHEDULED' },
  STATUS_CHANGED: { label: 'Status Changed', value: 'STATUS_CHANGED' },
  PREPARING_STARTED: { label: 'Preparing Started', value: 'PREPARING_STARTED' },
  READY_FOR_PICKUP: { label: 'Ready For Pickup', value: 'READY_FOR_PICKUP' },
  TRANSIT_STARTED: { label: 'Transit Started', value: 'TRANSIT_STARTED' },
  ARRIVED_AT_MEETUP: { label: 'Arrived at Meetup', value: 'ARRIVED_AT_MEETUP' },
  DELIVERED: { label: 'Delivered', value: 'DELIVERED' },
  COMPLETED: { label: 'Completed', value: 'COMPLETED' },
  FAILED: { label: 'Failed', value: 'FAILED' },
  CANCELLED: { label: 'Cancelled', value: 'CANCELLED' },
} as const;

export const DELIVERY_DECISIONS = {
  AGREED: { label: 'Agreed', value: 'AGREED' },
  DECLINED: { label: 'Declined', value: 'DECLINED' },
} as const;

export const DELIVERY_DETAILS_STATUS = {
  PENDING: { label: 'Waiting Response', value: 'PENDING' },
  ACCEPTED: { label: 'Accepted', value: 'ACCEPTED' },
  REJECTED: { label: 'Rejected', value: 'REJECTED' },
} as const;

export const DELIVERY_UPDATES = {
  WAITING: { label: 'Waiting', value: 'WAITING' },
  PREPARING: { label: 'Preparing', value: 'PREPARING' },
  PICKUP_READY: { label: 'Ready for Pickup', value: 'PICKUP_READY' },
  ON_THE_WAY: { label: 'On the Way', value: 'ON_THE_WAY' },
  ARRIVED: { label: 'Arrived', value: 'ARRIVED' },
  DELIVERED: { label: 'Delivered', value: 'DELIVERED' },
  COMPLETED: { label: 'Completed', value: 'COMPLETED' },
  FAILED: { label: 'Failed', value: 'FAILED' },
  CANCELLED: { label: 'Cancelled', value: 'CANCELLED' },
  DELAYED: { label: 'Delayed', value: 'DELAYED' },
} as const;
