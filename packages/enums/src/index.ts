export const PROFILE_TYPES = {
  INDIVIDUAL: { label: 'Individual', value: 'INDIVIDUAL' },
  HOSPITAL: { label: 'Hospital', value: 'HOSPITAL' },
  MILK_BANK: { label: 'Milk Bank', value: 'MILK_BANK' },
} as const;

export const ORGANIZATION_TYPES = {
  GOVERNMENT: { label: 'Government', value: 'GOVERNMENT' },
  PRIVATE: { label: 'Private', value: 'PRIVATE' },
  OTHER: { label: 'Other', value: 'OTHER' },
} as const;

export const GENDER_TYPES = {
  MALE: { label: 'Male', value: 'MALE' },
  FEMALE: { label: 'Female', value: 'FEMALE' },
  OTHER: { label: 'Other', value: 'OTHER' },
} as const;

export const MARITAL_STATUS = {
  SINGLE: { label: 'Single', value: 'SINGLE' },
  MARRIED: { label: 'Married', value: 'MARRIED' },
  SEPARATED: { label: 'Separated', value: 'SEPARATED' },
  WIDOWED: { label: 'Widowed', value: 'WIDOWED' },
  DIVORCED: { label: 'Divorced', value: 'DIVORCED' },
  N_A: { label: 'Prefer not to say', value: 'N/A' },
} as const;

export const DELIVERY_OPTIONS = {
  PICKUP: { label: 'Pickup', value: 'PICKUP' },
  DELIVERY: { label: 'Delivery', value: 'DELIVERY' },
  MEETUP: { label: 'Meet-up', value: 'MEETUP' },
} as const;

export const DAYS = {
  MONDAY: { label: 'Monday', value: 'MONDAY' },
  TUESDAY: { label: 'Tuesday', value: 'TUESDAY' },
  WEDNESDAY: { label: 'Wednesday', value: 'WEDNESDAY' },
  THURSDAY: { label: 'Thursday', value: 'THURSDAY' },
  FRIDAY: { label: 'Friday', value: 'FRIDAY' },
  SATURDAY: { label: 'Saturday', value: 'SATURDAY' },
  SUNDAY: { label: 'Sunday', value: 'SUNDAY' },
} as const;

export const URGENCY_LEVELS = {
  LOW: { label: 'Standard', value: 'LOW' },
  MEDIUM: { label: 'Urgent', value: 'MEDIUM' },
  HIGH: { label: 'Very Urgent', value: 'HIGH' },
  CRITICAL: { label: 'Emergency', value: 'CRITICAL' },
} as const;

export const PRIORITY_LEVELS = {
  LOW: { label: 'Low', value: 'LOW' },
  MEDIUM: { label: 'Medium', value: 'MEDIUM' },
  HIGH: { label: 'High', value: 'HIGH' },
  CRITICAL: { label: 'Critical', value: 'CRITICAL' },
} as const;

export const STORAGE_TYPES = {
  FRESH: { label: 'Refrigerated', value: 'FRESH' },
  FROZEN: { label: 'Frozen', value: 'FROZEN' },
} as const;

export const PREFERRED_STORAGE_TYPES = {
  ...STORAGE_TYPES,
  EITHER: {
    label: Object.values(STORAGE_TYPES)
      .map(({ label }) => label)
      .join(', '),
    value: 'EITHER',
  },
} as const;

export const COLLECTION_MODES = {
  MANUAL: { label: 'Hand Expression', value: 'MANUAL' },
  MANUAL_PUMP: { label: 'Manual Pump', value: 'MANUAL_PUMP' },
  ELECTRIC_PUMP: { label: 'Electric Pump', value: 'ELECTRIC_PUMP' },
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
};

export const DONATION_STATUS = {
  AVAILABLE: { label: 'Available', value: 'AVAILABLE' },
  PARTIALLY_ALLOCATED: { label: 'Partially Allocated', value: 'PARTIALLY_ALLOCATED' },
  FULLY_ALLOCATED: { label: 'Fully Allocated', value: 'FULLY_ALLOCATED' },
  EXPIRED: { label: 'Expired', value: 'EXPIRED' },
  CANCELLED: { label: 'Cancelled', value: 'CANCELLED' },
};

export const DONATION_REQUEST_STATUS = {
  PENDING: { label: 'Pending', value: 'PENDING' },
  APPROVED: { label: 'Approved', value: 'APPROVED' },
  REJECTED: { label: 'Rejected', value: 'REJECTED' },
  AVAILABLE: { label: 'Available', value: 'AVAILABLE' },
  COMPLETED: { label: 'Completed', value: 'COMPLETED' },
  EXPIRED: { label: 'Expired', value: 'EXPIRED' },
  CANCELLED: { label: 'Cancelled', value: 'CANCELLED' },
};

export const DONATION_VOLUME_STATUS = {
  UNALLOCATED: { label: 'Unallocated', value: 'UNALLOCATED' },
  PARTIALLY_ALLOCATED: { label: 'Partially Allocated', value: 'PARTIALLY_ALLOCATED' },
  FULLY_ALLOCATED: { label: 'Fully Allocated', value: 'FULLY_ALLOCATED' },
};

export const REQUEST_VOLUME_STATUS = {
  UNFULFILLED: { label: 'Unfulfilled', value: 'UNFULFILLED' },
  PARTIALLY_FULFILLED: { label: 'Partially Fulfilled', value: 'PARTIALLY_FULFILLED' },
  FULFILLED: { label: 'Fulfilled', value: 'FULFILLED' },
};

export const REQUEST_STATUS = {
  PENDING: { label: 'Pending', value: 'PENDING' },
  PARTIALLY_FULFILLED: { label: 'Partially Fulfilled', value: 'PARTIALLY_FULFILLED' },
  FULFILLED: { label: 'Fulfilled', value: 'FULFILLED' },
  EXPIRED: { label: 'Expired', value: 'EXPIRED' },
  CANCELLED: { label: 'Cancelled', value: 'CANCELLED' },
};
