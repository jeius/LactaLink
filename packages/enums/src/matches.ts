export const MATCHES_STATUS = {
  ACCEPTED: { label: 'Accepted', value: 'ACCEPTED' },
  REJECTED: { label: 'Rejected', value: 'REJECTED' },
  SCHEDULED: { label: 'Delivery Scheduled', value: 'SCHEDULED' },
  IN_TRANSIT: { label: 'In Transit', value: 'IN_TRANSIT' },
  COMPLETED: { label: 'Completed', value: 'COMPLETED' },
  CANCELLED: { label: 'Cancelled', value: 'CANCELLED' },
} as const;

export const MATCHES_TYPE = {
  P2P: { label: 'Peer to Peer', value: 'P2P' },
  P2O: { label: 'Peer to Organization', value: 'P2O' },
  O2P: { label: 'Organization to Peer', value: 'O2P' },
} as const;
