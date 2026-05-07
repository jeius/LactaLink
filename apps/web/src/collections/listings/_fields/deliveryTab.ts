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
      admin: {
        description: 'Delivery preferences for the milk',
      },
    },
  ],
});
