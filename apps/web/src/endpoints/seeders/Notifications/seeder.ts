import { Payload } from 'payload';
import { categoriesData } from './data/categories';
import { channelsData } from './data/channels';
import { typesData } from './data/types';

export async function seedNotificationSystem(payload: Payload) {
  payload.logger.info('Seeding notification system...');
  payload.logger.info('Clearing existing notification data...');

  // Clear existing data in notification collections
  await payload.delete({
    collection: 'notifications',
    where: {},
  });
  await payload.delete({
    collection: 'notificationTypes',
    where: {},
  });
  await payload.delete({
    collection: 'notificationChannels',
    where: {},
  });
  await payload.delete({
    collection: 'notificationCategories',
    where: {},
  });

  // Create categories
  console.log('Creating notification categories...');
  const categories = await Promise.all(
    categoriesData.map((categoryData) =>
      payload.create({
        collection: 'notificationCategories',
        data: categoryData,
      })
    )
  );

  // Create channels
  console.log('Creating notification channels...');
  const channels = await Promise.all(
    channelsData.map((channelData) =>
      payload.create({
        collection: 'notificationChannels',
        data: channelData,
      })
    )
  );

  // Create notification types with proper relationships
  console.log('Creating notification types...');
  const categoryMap = {
    DONATION_LIFECYCLE: categories.find((c) => c.key === 'DONATION_LIFECYCLE')?.id,
    REQUEST_LIFECYCLE: categories.find((c) => c.key === 'REQUEST_LIFECYCLE')?.id,
    MATCHING: categories.find((c) => c.key === 'MATCHING')?.id,
    DELIVERY: categories.find((c) => c.key === 'DELIVERY')?.id,
    SYSTEM: categories.find((c) => c.key === 'SYSTEM')?.id,
  };

  const channelMap = {
    IN_APP: channels.find((c) => c.key === 'IN_APP_REALTIME')?.id,
    EMAIL: channels.find((c) => c.key === 'EMAIL_PRIMARY')?.id,
    SMS: channels.find((c) => c.key === 'SMS_URGENT')?.id,
  };

  const types = await Promise.all(
    typesData.map((typeData) => {
      // Assign category based on notification type
      let categoryId: string | undefined;
      if (typeData.key.startsWith('DONATION_')) {
        categoryId = categoryMap.DONATION_LIFECYCLE;
      } else if (typeData.key.startsWith('REQUEST_')) {
        categoryId =
          typeData.key === 'REQUEST_MATCHED' ? categoryMap.MATCHING : categoryMap.REQUEST_LIFECYCLE;
      } else if (typeData.key.startsWith('DELIVERY_')) {
        categoryId = categoryMap.DELIVERY;
      } else {
        categoryId = categoryMap.SYSTEM;
      }

      // Assign default channels based on priority
      let defaultChannels: (string | undefined)[];
      if (typeData.priority === 'HIGH') {
        defaultChannels = [channelMap.IN_APP, channelMap.EMAIL, channelMap.SMS];
      } else {
        defaultChannels = [channelMap.IN_APP, channelMap.EMAIL];
      }

      if (!categoryId) {
        throw new Error(`Category not found for type: ${typeData.key}`);
      }

      return payload.create({
        collection: 'notificationTypes',
        data: {
          ...typeData,
          category: categoryId,
          defaultChannels: defaultChannels.filter((v) => v !== undefined),
        },
      });
    })
  );

  payload.logger.info(`Successfully created:
    - ${categories.length} notification categories
    - ${channels.length} notification channels  
    - ${types.length} notification types
  `);

  payload.logger.info('Notification system seeded successfully! 🎉');

  return {
    categories,
    channels,
    types,
  };
}
