import { NotificationChannel } from '@lactalink/types';

export const channelsData: Omit<NotificationChannel, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    key: 'IN_APP_REALTIME',
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
