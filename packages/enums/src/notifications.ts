export const SYSTEM_COLORS = {
  PRIMARY: { label: 'Primary', value: 'PRIMARY' },
  SECONDARY: { label: 'Secondary', value: 'SECONDARY' },
  TERTIARY: { label: 'Tertiary', value: 'TERTIARY' },
  POSITIVE: { label: 'Positive', value: 'POSITIVE' },
  WARNING: { label: 'Warning', value: 'WARNING' },
  DANGER: { label: 'Danger', value: 'DANGER' },
  INFO: { label: 'Info', value: 'INFO' },
  MUTED: { label: 'Muted', value: 'MUTED' },
  DEFAULT: { label: 'Default', value: 'DEFAULT' },
} as const;

export const NOTIFICATION_TRIGGER_EVENT_OPTIONS = {
  CREATE: { label: 'Create', value: 'CREATE' },
  UPDATE: { label: 'Update', value: 'UPDATE' },
  DELETE: { label: 'Delete', value: 'DELETE' },
} as const;

export const NOTIFICATION_TRIGGER_COLLECTION_OPTIONS = {
  REQUESTS: { label: 'Requests', value: 'requests' },
  DONATIONS: { label: 'Donations', value: 'donations' },
  TRANSACTIONS: { label: 'Transactions', value: 'transactions' },
} as const;

export const NOTIFICATION_CHANNEL_TYPE_OPTIONS = {
  IN_APP: { label: 'In-App Notification', value: 'IN_APP' },
  EMAIL: { label: 'Email', value: 'EMAIL' },
  SMS: { label: 'SMS', value: 'SMS' },
  PUSH: { label: 'Push Notification', value: 'PUSH' },
  WEBHOOK: { label: 'Webhook', value: 'WEBHOOK' },
  EXTERNAL_API: { label: 'External API', value: 'EXTERNAL_API' },
} as const;

export const NOTIFICATION_JS_TYPES = {
  string: { label: 'String', value: 'string' },
  number: { label: 'Number', value: 'number' },
  boolean: { label: 'Boolean', value: 'boolean' },
  data: { label: 'Date', value: 'date' },
  array: { label: 'Array', value: 'array' },
  object: { label: 'Object', value: 'object' },
} as const;
