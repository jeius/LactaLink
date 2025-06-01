import { Payload } from 'payload';

export async function seedNotificationSystem(payload: Payload) {
  // 1. Create categories
  const categories = await Promise.all([
    payload.create({
      collection: 'notificationCategories',
      data: {
        key: 'MATCHING',
        name: 'Matching Notifications',
        description: 'Notifications related to matching donations and requests',
        color: '#3B82F6', // Blue
        icon: 'match-icon',
      },
    }),
  ]);

  // 2. Create channels
  const channels = await Promise.all([
    payload.create({
      collection: 'notificationChannels',
      data: {
        key: 'IN_APP',
        name: 'In-App Notifications',
        type: 'IN_APP',
        active: true,
        retrySettings: {
          maxRetries: 3,
          retryDelay: 5000, // 5 seconds
        },
      },
    }),
  ]);

  // 3. Create types
  const types = await Promise.all([
    payload.create({
      collection: 'notificationTypes',
      data: {
        key: 'DONATION_MATCHED',
        name: 'Donation Matched',
        category: categories[0].id, // Use the first category created
        description: 'Triggered when a donation is matched with a request',
        priority: 'HIGH',
        defaultChannels: [channels[0].id], // Use the first channel created
        triggers: {
          collection: 'donations',
          event: 'CREATE',
        },
        template: {
          title: 'Donation Matched',
          message:
            'Your donation of {{amount}} mL has been matched with a request from {{requesterName}}.',
          variables: [
            { key: 'amount', description: 'Amount of milk in mL' },
            { key: 'requesterName', description: 'Name of the requester.' },
            { key: 'requestId', description: 'ID of the matched request' },
          ],
        },
        active: true,
      },
    }),
    // ... more types
  ]);

  console.log('Notification system seeded successfully!');
}
