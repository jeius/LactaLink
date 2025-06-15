export const PROFILE_TYPES = {
  individual: { label: 'Individual', value: 'INDIVIDUAL' },
  hospital: { label: 'Hospital', value: 'HOSPITAL' },
  milkBank: { label: 'Milk Bank', value: 'MILK_BANK' },
} as const;

export const ORGANIZATION_TYPES = {
  government: { label: 'Government', value: 'GOVERNMENT' },
  private: { label: 'Private', value: 'PRIVATE' },
  other: { label: 'Other', value: 'OTHER' },
} as const;

export const GENDER_TYPES = {
  male: { label: 'Male', value: 'MALE' },
  female: { label: 'Femaile', value: 'FEMALE' },
  other: { label: 'Other', value: 'OTHER' },
} as const;

export const MARITAL_STATUS = {
  single: { label: 'Single', value: 'SINGLE' },
  married: { label: 'Married', value: 'MARRIED' },
  separated: { label: 'Separated', value: 'SEPARATED' },
  widowed: { label: 'Widowed', value: 'WIDOWED' },
  divorced: { label: 'Divorced', value: 'DIVORCED' },
  na: { label: 'Prefer not to say', value: 'N/A' },
} as const;

export const DELIVERY_OPTIONS = {
  PICKUP: { label: 'Pickup', value: 'PICKUP' },
  DELIVERY: { label: 'Delivery', value: 'DELIVERY' },
  MEETUP: { label: 'Meet-up', value: 'MEETUP' },
} as const;

export const DAYS = {
  mon: { label: 'Monday', value: 'MONDAY' },
  tue: { label: 'Tuesday', value: 'TUESDAY' },
  wed: { label: 'Wednesday', value: 'WEDNESDAY' },
  thu: { label: 'Thursday', value: 'THURSDAY' },
  fri: { label: 'Friday', value: 'FRIDAY' },
  sat: { label: 'Saturday', value: 'SATURDAY' },
  sun: { label: 'Sunday', value: 'SUNDAY' },
} as const;

export const PRIORITY_LEVELS = {
  low: { label: 'Low', value: 'LOW' },
  med: { label: 'Medium', value: 'MEDIUM' },
  high: { label: 'High', value: 'HIGH' },
  critical: { label: 'Critical', value: 'CRITICAL' },
} as const;

export const STORAGE_TYPES = {
  fresh: { label: 'Fresh (Refrigerated)', value: 'FRESH' },
  frozen: { label: 'Frozen', value: 'FROZEN' },
} as const;

export const COLLECTION_MODES = {
  hand: { label: 'Hand Expression', value: 'MANUAL' },
  manualPump: { label: 'Manual Pump', value: 'MANUAL_PUMP' },
  electricPump: { label: 'Electric Pump', value: 'ELECTRIC_PUMP' },
} as const;

export const TIME_SLOT_TYPES = {
  custom: { label: 'Custom', value: 'CUSTOM' },
  preset: { label: 'Preset', value: 'PRESET' },
};

export const TIME_SLOTS = {
  '08:00-10:00': { label: '8:00 AM - 10:00 AM', value: '08:00-10:00' },
  '10:00-12:00': { label: '10:00 AM - 12:00 PM', value: '10:00-12:00' },
  '12:00-14:00': { label: '12:00 PM - 2:00 PM', value: '12:00-14:00' },
  '14:00-16:00': { label: '2:00 PM - 4:00 PM', value: '14:00-16:00' },
  '16:00-18:00': { label: '4:00 PM - 6:00 PM', value: '16:00-18:00' },
  '18:00-20:00': { label: '6:00 PM - 8:00 PM', value: '18:00-20:00' },
};
