import { filterDeliveryPreferences } from '@/lib/utils/collections/filterDeliveryPreferences';
import { Tab } from 'payload';

export const deliveryTab = (): Tab => ({
  label: 'Delivery',
  fields: [
    {
      name: 'deliveryPreferences',
      label: 'Delivery Preferences',
      type: 'relationship',
      relationTo: 'delivery-preferences',
      hasMany: true,
      filterOptions: filterDeliveryPreferences,
      validate: (value) => {
        if (value?.length === 0) {
          return 'At least one delivery preference must be provided';
        }
        return true;
      },
      admin: {
        description: 'Delivery preferences for the milk',
      },
    },
  ],
});
