import { DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import { DeliveryMode } from '@/lib/types';
import { Field } from 'payload';

interface DeliveryTabFieldsOptions {
  defaultPreferredModes?: DeliveryMode[];
}

export const deliveryTabFields = (options: DeliveryTabFieldsOptions = {}): Field[] => {
  const defaultModeValues = Object.values(DELIVERY_OPTIONS).map((option) => option.value);
  const { defaultPreferredModes = defaultModeValues } = options;

  return [
    {
      name: 'preferredModes',
      label: 'Preferred Delivery Modes',
      type: 'select',
      enumName: 'enum_delivery_modes',
      hasMany: true,
      required: true,
      defaultValue: defaultPreferredModes,
      options: Object.values(DELIVERY_OPTIONS),
      admin: {
        description: 'Preferred delivery modes of the individual. This will be used for matching.',
      },
    },
    {
      name: 'pickupAddress',
      label: 'Pick-up Address',
      type: 'relationship',
      relationTo: 'addresses',
      admin: {
        description: 'Address available for pickup.',
        condition: (_, { preferredModes }) =>
          preferredModes?.includes(DELIVERY_OPTIONS.PICKUP.value),
      },
    },
    {
      name: 'deliveryAddress',
      label: 'Delivery Address',
      type: 'relationship',
      relationTo: 'addresses',
      admin: {
        description: 'Address available for delivery.',
        condition: (_, { preferredModes }) =>
          preferredModes?.includes(DELIVERY_OPTIONS.DELIVERY.value),
      },
    },
    {
      name: 'meetupAddress',
      label: 'Meet-up Address',
      type: 'relationship',
      relationTo: 'addresses',
      admin: {
        description: 'Address available for meet-up.',
        condition: (_, { preferredModes }) =>
          preferredModes?.includes(DELIVERY_OPTIONS.MEETUP.value),
      },
    },
    {
      name: 'availableDays',
      label: 'Available Days',
      type: 'select',
      enumName: 'enum_days',
      hasMany: true,
      options: Object.values(DAYS),
      admin: {
        description: 'Days available for processing.',
      },
    },
  ];
};
