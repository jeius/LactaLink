import { NOTIFICATION_CHANNEL_TYPE_OPTIONS } from '@lactalink/enums';
import { NotificationChannel } from '@lactalink/types';

export const CHANNEL_KEYS = {
  IN_APP: NOTIFICATION_CHANNEL_TYPE_OPTIONS.IN_APP.value,
  EMAIL: NOTIFICATION_CHANNEL_TYPE_OPTIONS.EMAIL.value,
  PUSH: NOTIFICATION_CHANNEL_TYPE_OPTIONS.PUSH.value,
  SMS: NOTIFICATION_CHANNEL_TYPE_OPTIONS.SMS.value,
} as const;

export const channelsData: Omit<NotificationChannel, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    key: CHANNEL_KEYS.IN_APP,
    name: 'In-App Real-time',
    type: 'IN_APP',
    description: 'Real-time notifications displayed within the LactaLink app via Supabase',
    active: true,
    delivery: {
      metadata: {
        priority: 1,
        tags: 'in-app, realtime',
      },
    },
  },
];
