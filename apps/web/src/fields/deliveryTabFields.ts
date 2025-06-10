import { DeliveryMode, Donation, Request } from '@lactalink/types';
import { DAYS, DELIVERY_OPTIONS } from '@lactalink/types/enums';
import { extractID } from '@lactalink/utilities';
import { Field, FilterOptions } from 'payload';

interface DeliveryTabFieldsOptions {
  defaultPreferredModes?: DeliveryMode[];
}

export const deliveryDetailsField = (options: DeliveryTabFieldsOptions = {}): Field => {
  const defaultModeValues = Object.values(DELIVERY_OPTIONS).map((option) => option.value);
  const { defaultPreferredModes = defaultModeValues } = options;

  const defaultValue = defaultPreferredModes.map((mode) => ({
    preferredModes: mode,
  }));

  return {
    name: 'deliveryDetails',
    label: 'Delivery Details',
    type: 'array',
    defaultValue,
    fields: [
      {
        name: 'preferredModes',
        label: 'Preferred Delivery Modes',
        type: 'select',
        enumName: 'enum_delivery_modes',
        required: true,
        options: Object.values(DELIVERY_OPTIONS),
        admin: {
          description:
            'Preferred delivery modes of the individual. This will be used for matching.',
        },
      },
      {
        name: 'address',
        label: 'Address',
        type: 'relationship',
        relationTo: 'addresses',
        hasMany: false,
        required: true,
        filterOptions: filterOptions,
        admin: {
          description: 'Address available for pickup, delivery, or meet-up.',
        },
      },
      {
        name: 'availableDays',
        label: 'Available Days',
        type: 'select',
        enumName: 'enum_days',
        hasMany: true,
        required: true,
        defaultValue: Object.values(DAYS).map((day) => day.value),
        options: Object.values(DAYS),
        admin: {
          description: 'Days available for pickup, delivery, or meet-up.',
        },
      },
    ],
  };
};

const filterOptions: FilterOptions<Donation | Request> = async ({ data, req }) => {
  let individualId: string | undefined = undefined;

  if (data && 'donor' in data && data.donor) {
    individualId = extractID(data.donor);
  }

  if (data && 'requester' in data && data.requester) {
    individualId = extractID(data.requester);
  }

  if (!individualId) {
    return true; // No individual ID, no filtering needed
  }

  const { owner } = await req.payload.findByID({
    id: individualId,
    collection: 'individuals',
    depth: 0,
    select: { owner: true },
  });

  return owner ? { owner: { equals: extractID(owner) } } : true;
};
