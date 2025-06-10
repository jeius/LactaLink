export const COLLECTION_GROUP = {
  USER: 'User Management',
  CONTENT: 'Content Management',
  SYSTEM: 'System Management',
  PROFILES: 'Profiles Management',
  DONATIONS: 'Donations & Requests Management',
  PSGC: 'PSGC Data Management',
  TICKET: 'Ticket Management',
};

export const NOTIFICATION_TRIGGER_EVENT_OPTIONS = [
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
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

export const MILK_EXPIRY_DAYS = 3;
