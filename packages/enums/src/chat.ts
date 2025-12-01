export const MESSAGE_TYPE = {
  TEXT: { value: 'TEXT', label: 'Text' },
  SYSTEM: { value: 'SYSTEM', label: 'System' },
  ATTACHMENT: { value: 'ATTACHMENT', label: 'Attachment' },
} as const;

export const CONVERSATION_TYPE = {
  DIRECT: { label: 'Direct (1-to-1)', value: 'DIRECT' },
  GROUP: { label: 'Group', value: 'GROUP' },
} as const;

export const CONVERSATION_ROLE = {
  ADMIN: { label: 'Admin', value: 'ADMIN' },
  MODERATOR: { label: 'Moderator', value: 'MODERATOR' },
  MEMBER: { label: 'Member', value: 'MEMBER' },
} as const;
