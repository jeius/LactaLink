import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { MILK_BAG_OWNERSHIP_TRANSFER_REASONS } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../../_access-control';

const REASON_OPTIONS = MILK_BAG_OWNERSHIP_TRANSFER_REASONS;

export const MilkBagOwnershipHistory: CollectionConfig<'milkbag-ownership-histories'> = {
  slug: 'milkbag-ownership-histories',
  labels: {
    singular: 'Milk Bag Ownership History',
    plural: 'Milk Bag Ownership Histories',
  },
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: admin,
    delete: admin,
  },
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'id',
    defaultColumns: ['milkBag', 'previousOwner', 'newOwner', 'transferReason', 'transferredAt'],
    hidden: true,
  },
  fields: [
    {
      name: 'milkBag',
      type: 'relationship',
      relationTo: 'milkBags',
      required: true,
      index: true,
      admin: {
        description: 'The milk bag this ownership record belongs to',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'previousOwner',
          type: 'relationship',
          relationTo: ['individuals', 'hospitals', 'milkBanks'],
          required: true,
          admin: {
            description: 'The previous owner of the milk bag',
            width: '50%',
          },
        },
        {
          name: 'newOwner',
          type: 'relationship',
          relationTo: ['individuals', 'hospitals', 'milkBanks'],
          required: true,
          admin: {
            description: 'The new owner of the milk bag',
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'transferReason',
          type: 'select',
          enumName: 'enum_milk_bag_transfer_reason',
          required: true,
          defaultValue: REASON_OPTIONS['N/A'].value,
          options: Object.values(REASON_OPTIONS),
          admin: {
            description: 'The reason for the ownership transfer',
            width: '50%',
          },
        },
        {
          name: 'transferredAt',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
          admin: {
            description: 'The date and time of the ownership transfer',
            width: '50%',
          },
        },
      ],
    },
  ],
};
