export const MILK_BAG_STATUS = {
  DRAFT: { label: 'Draft', value: 'DRAFT' },
  AVAILABLE: { label: 'Available', value: 'AVAILABLE' },
  ALLOCATED: { label: 'Allocated', value: 'ALLOCATED' },
  CONSUMED: { label: 'Consumed', value: 'CONSUMED' },
  EXPIRED: { label: 'Expired', value: 'EXPIRED' },
  DISCARDED: { label: 'Discarded', value: 'DISCARDED' },
};

export const MILK_BAG_OWNERSHIP_TRANSFER_REASONS = {
  DONATION_COMPLETED: { label: 'Donation Completed', value: 'DONATION_COMPLETED' },
  REDISTRIBUTION: { label: 'Redistribution', value: 'REDISTRIBUTION' },
  RETURN: { label: 'Return', value: 'RETURN' },
  'N/A': { label: 'Not Applicable', value: 'N/A' },
} as const;
