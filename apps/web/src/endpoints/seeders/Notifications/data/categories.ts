import { NOTIFICATION_CATEGORY_KEYS, SYSTEM_COLORS } from '@lactalink/enums';
import { NotificationCategory } from '@lactalink/types';
import { RequiredDataFromCollection } from 'payload';

export const CATEGORY_KEYS = NOTIFICATION_CATEGORY_KEYS;

export const categoriesData: RequiredDataFromCollection<NotificationCategory>[] = [
  {
    key: CATEGORY_KEYS.MATCHING,
    name: 'Matching & Allocation',
    description: 'Notifications when donations/requests are matched or allocated',
    color: SYSTEM_COLORS.PRIMARY.value,
    active: true,
    sortOrder: 1,
  },
  {
    key: CATEGORY_KEYS.TRANSACTION,
    name: 'Transaction Updates',
    description: 'Notifications about transaction status and updates',
    color: SYSTEM_COLORS.PRIMARY.value,
    active: true,
    sortOrder: 2,
  },
  {
    key: CATEGORY_KEYS.LIFECYCLE,
    name: 'Donation/Request Status',
    description: 'Updates about the availability and lifecycle of donations and requests',
    color: SYSTEM_COLORS.INFO.value,
    active: true,
    sortOrder: 3,
  },
  {
    key: CATEGORY_KEYS.SYSTEM,
    name: 'System Notifications',
    description: 'Important system updates and announcements',
    color: SYSTEM_COLORS.DEFAULT.value,
    active: true,
    sortOrder: 5,
  },
];
