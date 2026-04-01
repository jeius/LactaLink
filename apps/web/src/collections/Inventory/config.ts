import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { NullableValidator } from '@lactalink/agents/payload';
import { INVENTORY_STATUS } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { anyone } from '../_access-control';
import { inventoryOwnerOrAdminWrite } from './access';
import { afterChange } from './hooks/afterChange';
import { beforeValidate } from './hooks/beforeValidate';
import { generateInventoryCode } from './hooks/fieldHooks';

export const Inventories: CollectionConfig<'inventories'> = {
  slug: 'inventories',

  // Payload trash: deletes move to trash in the admin UI instead of hard-deleting.
  // Records can be restored or permanently purged by admins.
  trash: true,

  // Versioning: every save creates an audit record so volume changes are fully traceable.
  versions: {
    maxPerDoc: 100,
  },

  timestamps: true,

  access: {
    // Public users can read volume stats; sensitive fields are restricted at field level
    read: anyone,
    // Only the owning organization (or admin) can create, update, or delete
    create: inventoryOwnerOrAdminWrite,
    update: inventoryOwnerOrAdminWrite,
    delete: inventoryOwnerOrAdminWrite,
  },

  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'code',
    defaultColumns: [
      'code',
      'organization',
      'remainingVolume',
      'reservedVolume',
      'status',
      'receivedAt',
    ],
    listSearchableFields: ['code'],
    description: 'Milk inventory held by hospitals and milk banks',
  },

  hooks: {
    beforeValidate: [beforeValidate],
    afterChange: [afterChange],
  },

  // Database-level indexes for the most common query patterns
  indexes: [{ fields: ['status'] }, { fields: ['expiresAt'] }],

  fields: [
    {
      name: 'code',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      hooks: { beforeChange: [generateInventoryCode] },
      validate: NullableValidator.text,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Human-readable identifier — auto-generated on create (e.g. "INV-A3F2E1")',
      },
    },

    {
      name: 'organization',
      type: 'relationship',
      relationTo: ['hospitals', 'milkBanks'],
      required: true,
      index: true,
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
            description: 'Volume received into inventory (ml)',
            readOnly: true,
            width: '30%',
          },
        },
        {
          name: 'remainingVolume',
          type: 'number',
          required: true,
          admin: {
            description: 'Volume still uncommitted (ml)',
            readOnly: true,
            width: '30%',
          },
        },
        {
          name: 'reservedVolume',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Volume committed to pending allocations but not yet delivered (ml)',
            readOnly: true,
            width: '40%',
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
      index: true,
    },

    {
      name: 'receivedAt',
      type: 'date',
      defaultValue: () => new Date(),
      admin: {
        description: 'When the organization received this donation',
        position: 'sidebar',
      },
    },

    {
      name: 'expiresAt',
      label: 'Earliest Expiry Date',
      type: 'date',
      index: true,
      admin: {
        description: 'Earliest expiry date across all bags in this inventory',
        position: 'sidebar',
      },
    },

    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes about this inventory item',
      },
    },

    {
      name: 'inputBags',
      type: 'relationship',
      relationTo: 'milkBags',
      hasMany: true,
      virtual: true,
      required: true,
      minRows: 1,
      admin: {
        description: 'Virtual field to link milk bags to inventory on create via hooks',
        hidden: true,
        readOnly: true,
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Milk Bags',
          fields: [
            {
              name: 'milkBags',
              label: 'Milk Bags',
              type: 'join',
              collection: 'milkBags',
              on: 'inventory',
              maxDepth: 3,
              defaultLimit: 10,
              admin: {
                description: 'Milk bags in this inventory',
                defaultColumns: ['title', 'status', 'collectedAt', 'expiresAt'],
              },
            },
          ],
        },

        {
          label: 'Allocations',
          admin: {
            description: 'All allocation records dispatched from this inventory',
          },
          fields: [
            {
              name: 'allocations',
              label: 'Inventory Allocations',
              type: 'join',
              collection: 'inventory-allocations',
              on: 'inventory',
              maxDepth: 3,
              defaultLimit: 10,
              admin: {
                defaultColumns: ['allocatedVolume', 'status', 'allocatedAt'],
              },
            },
          ],
        },
      ],
    },
  ],
};
