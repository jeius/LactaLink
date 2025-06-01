import { NotificationCategory } from '@lactalink/types';

export const categoriesData: Omit<NotificationCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    key: 'MATCHING',
    name: 'Matching & Allocation',
    description: 'Notifications when donations are matched with requests',
    color: '#10B981', // Green
    icon: 'heart-handshake',
    active: true,
    sortOrder: 1,
  },
  {
    key: 'DELIVERY',
    name: 'Delivery Updates',
    description: 'Notifications about delivery status and logistics',
    color: '#3B82F6', // Blue
    icon: 'truck',
    active: true,
    sortOrder: 2,
  },
  {
    key: 'DONATION_LIFECYCLE',
    name: 'Donation Status',
    description: 'Updates about donation availability and lifecycle',
    color: '#8B5CF6', // Purple
    icon: 'droplet',
    active: true,
    sortOrder: 3,
  },
  {
    key: 'REQUEST_LIFECYCLE',
    name: 'Request Status',
    description: 'Updates about request fulfillment and status',
    color: '#F59E0B', // Amber
    icon: 'hand-heart',
    active: true,
    sortOrder: 4,
  },
  {
    key: 'SYSTEM',
    name: 'System Notifications',
    description: 'Important system updates and announcements',
    color: '#6B7280', // Gray
    icon: 'bell',
    active: true,
    sortOrder: 5,
  },
];
