import { Payload } from 'payload';
import { categoriesData, CATEGORY_KEYS } from './data/categories';
import { CHANNEL_KEYS, channelsData } from './data/channels';
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
    LIFECYCLE: categories.find((c) => c.key === CATEGORY_KEYS.LIFECYCLE)?.id,
    MATCHING: categories.find((c) => c.key === CATEGORY_KEYS.MATCHING)?.id,
    TRANSACTION: categories.find((c) => c.key === CATEGORY_KEYS.TRANSACTION)?.id,
    SYSTEM: categories.find((c) => c.key === CATEGORY_KEYS.SYSTEM)?.id,
  };

  const channelMap = {
    IN_APP: channels.find((c) => c.key === CHANNEL_KEYS.IN_APP)?.id,
    EMAIL: channels.find((c) => c.key === CHANNEL_KEYS.EMAIL)?.id,
    SMS: channels.find((c) => c.key === CHANNEL_KEYS.SMS)?.id,
    PUSH: channels.find((c) => c.key === CHANNEL_KEYS.PUSH)?.id,
  };

  const types = await Promise.all(
    typesData.map((typeData) => {
      // Assign category based on notification type
      let categoryId: string | undefined;
      if (typeData.key.startsWith('DONATION_') || typeData.key.startsWith('REQUEST_')) {
        categoryId = categoryMap.LIFECYCLE;
      } else if (typeData.key.startsWith('TRANSACTION_')) {
        categoryId = categoryMap.TRANSACTION;
      } else if (typeData.key.startsWith('MATCHING_')) {
        categoryId = categoryMap.MATCHING;
      } else {
        categoryId = categoryMap.SYSTEM;
      }

      // Assign default channels based on priority
      let defaultChannels = Object.values(channelMap);

      if (typeData.priority === 'LOW') {
        defaultChannels = [channelMap.IN_APP];
      } else if (typeData.priority === 'MEDIUM') {
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
