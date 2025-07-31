import { COLLECTION_GROUP, INVENTORY_STATUS } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { initializeInventory } from './hooks/initializeInventory';
import { updateInventoryStatus } from './hooks/updateInventoryStatus';

export const Inventory: CollectionConfig<'inventory'> = {
  slug: 'inventory',
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'sourceDonation',
    defaultColumns: ['organization', 'initialVolume', 'remainingVolume', 'status', 'receivedAt'],
  },
  hooks: {
    beforeChange: [updateInventoryStatus],
    beforeValidate: [initializeInventory],
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: ['hospitals', 'milkBanks'],
      required: true,
    },

    {
      name: 'sourceDonation',
      type: 'relationship',
      relationTo: 'donations',
      admin: {
        description: 'Original donation that created this inventory',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'initialVolume',
          type: 'number',
          required: true,
          admin: {
            description: 'Initial volume received into inventory (may differ from donation volume)',
            readOnly: true,
          },
        },
        {
          name: 'remainingVolume',
          type: 'number',
          required: true,
          admin: {
            description: 'Volume still available for use in milliliters',
            readOnly: true,
          },
        },
      ],
    },

    {
      name: 'status',
      type: 'select',
      enumName: 'enum_inventory_status',
      options: Object.values(INVENTORY_STATUS),
      defaultValue: INVENTORY_STATUS.AVAILABLE.value,
      required: true,
    },

    {
      name: 'milkBags',
      label: 'Milk Bags',
      type: 'relationship',
      relationTo: 'milkBags',
      hasMany: true,
      required: true,
      admin: {
        description: 'Milk bags in this inventory',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'receivedAt',
          type: 'date',
          defaultValue: () => new Date(),
          admin: {
            description: 'When the organization received this donation',
          },
        },
        {
          name: 'expiresAt',
          type: 'date',
          admin: {
            description: 'When this inventory item expires',
          },
        },
      ],
    },

    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes about this inventory item',
      },
    },
    {
      name: 'allocationDetails',
      type: 'array',
      admin: {
        description: 'Details about how this inventory was allocated to requests',
      },
      fields: [
        {
          name: 'request',
          type: 'relationship',
          relationTo: 'requests',
          required: true,
        },
        {
          name: 'allocatedBags',
          type: 'relationship',
          relationTo: 'milkBags',
          hasMany: true,
          required: true,
          admin: {
            description: 'Milk bags allocated to this request',
          },
        },
        {
          name: 'allocationId',
          type: 'text',
          admin: {
            description: 'Unique identifier for grouping allocations that fulfill the same request',
            readOnly: true,
          },
        },
        {
          name: 'allocatedAt',
          type: 'date',
          defaultValue: () => new Date(),
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },
  ],
};
