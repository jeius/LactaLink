import { filterDeliveryPreferences } from '@/lib/utils/collections/filterDeliveryPreferences';
import { Tab } from 'payload';

export const deliveryTab: Tab = {
  label: 'Delivery',
  fields: [
    {
      name: 'deliveryDetails',
      label: 'Delivery Preferences',
      type: 'relationship',
      relationTo: 'delivery-preferences',
      hasMany: true,
      required: true,
      filterOptions: filterDeliveryPreferences,
      validate: (value) => {
        if (!value || value.length === 0) {
          return 'At least one delivery preference must be selected';
        }
        return true;
      },
      admin: {
        description: 'Delivery preferences for the milk donation',
      },
    },
    {
      name: 'deliveries',
      label: 'Deliveries',
      type: 'join',
      on: 'donation',
      collection: 'deliveries',
    },
  ],
};
