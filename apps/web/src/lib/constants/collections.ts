export const COLLECTION_GROUP = {
  USER: 'User Management',
  CONTENT: 'Content Management',
  SYSTEM: 'System Management',
  PROFILES: 'Profiles Management',
  DONATIONS: 'Donations & Requests Management',
  PSGC: 'PSGC Data Management',
  TICKET: 'Ticket Management',
};

export const DELIVERY_OPTIONS = {
  PICKUP: { label: 'Pickup', value: 'PICKUP' },
  DELIVERY: { label: 'Delivery', value: 'DELIVERY' },
  MEETUP: { label: 'Meet-up', value: 'MEETUP' },
} as const;

export const DAYS = {
  EVERYDAY: { label: 'Everyday', value: 'EVERYDAY' },
  MONDAY: { label: 'Monday', value: 'MONDAY' },
  TUESDAY: { label: 'Tuesday', value: 'TUESDAY' },
  WEDNESDAY: { label: 'Wednesday', value: 'WEDNESDAY' },
  THURSDAY: { label: 'Thursday', value: 'THURSDAY' },
  FRIDAY: { label: 'Friday', value: 'FRIDAY' },
  SATURDAY: { label: 'Saturday', value: 'SATURDAY' },
  SUNDAY: { label: 'Sunday', value: 'SUNDAY' },
} as const;

export const PRIORITY_LEVEL_OPTIONS = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
];

export const NOTIFICATION_TRIGGER_EVENT_OPTIONS = [
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
  { label: 'Status Change', value: 'STATUS_CHANGE' },
  { label: 'Scheduled', value: 'SCHEDULED' },
];

export const NOTIFICATION_TRIGGER_COLLECTION_OPTIONS = [
  { label: 'Requests', value: 'requests' },
  { label: 'Donations', value: 'donations' },
  { label: 'Deliveries', value: 'deliveries' },
  { label: 'System', value: 'system' },
];

export const NOTIFICATION_CHANNEL_TYPE_OPTIONS = [
  { label: 'In-App Notification', value: 'IN_APP' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'SMS', value: 'SMS' },
  { label: 'Push Notification', value: 'PUSH' },
  { label: 'Webhook', value: 'WEBHOOK' },
  { label: 'External API', value: 'EXTERNAL_API' },
];
