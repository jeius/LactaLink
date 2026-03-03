import { admin } from '@/collections/_access-control';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { NullableValidator } from '@lactalink/agents/payload';
import { INVENTORY_ALLOCATION_STATUS } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { allocationReadAccess, allocationWriteAccess } from './access';
import { afterChange } from './hooks/afterChange';
import {
  calculateInitialVolume,
  defaultAllocationDate,
  defaultAllocationID,
  defaultStatus,
} from './hooks/fieldHooks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InventoryAllocations: CollectionConfig<any> = {
  slug: 'inventory-allocations',
  labels: {
    singular: 'Inventory Allocation',
    plural: 'Inventory Allocations',
  },
  // Soft delete — moves records to Payload trash instead of hard-deleting
  trash: true,
  timestamps: true,
  access: {
    admin: admin,
    read: allocationReadAccess,
    create: allocationWriteAccess,
    update: allocationWriteAccess,
    delete: allocationWriteAccess,
  },
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'allocationId',
    defaultColumns: ['inventory', 'request', 'allocatedVolume', 'status', 'allocatedAt'],
    description: 'Records of milk inventory dispatched to fulfill recipient requests',
    hidden: true, // Not a user-facing collection, so hide from main admin sidebar
  },
  hooks: {
    afterChange: [afterChange],
  },
  indexes: [{ fields: ['inventory'] }, { fields: ['request'] }, { fields: ['status'] }],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'inventory',
          type: 'relationship',
          relationTo: 'inventories',
          required: true,
          index: true,
          admin: {
            description: 'The inventory pool this allocation draws from',
            width: '50%',
          },
        },
        {
          name: 'request',
          type: 'relationship',
          relationTo: 'requests',
          required: true,
          index: true,
          admin: {
            description: 'The recipient request being fulfilled',
            width: '50%',
          },
        },
      ],
    },

    {
      name: 'allocatedBags',
      label: 'Allocated Milk Bags',
      type: 'relationship',
      relationTo: 'milkBags',
      hasMany: true,
      required: true,
      admin: {
        description: 'Specific milk bags dispatched for this request',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'allocatedVolume',
          type: 'number',
          defaultValue: 0,
          required: true,
          hooks: { beforeChange: [calculateInitialVolume] },
          validate: NullableValidator.number,
          admin: {
            description: 'Total volume of allocated bags in milliliters (auto-calculated)',
            readOnly: true,
            width: '50%',
          },
        },

        {
          name: 'allocatedAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
          hooks: { beforeChange: [defaultAllocationDate] },
          validate: NullableValidator.date,
          admin: { width: '50%' },
        },
      ],
    },

    {
      name: 'status',
      type: 'select',
      enumName: 'enum_inventory_allocation_status',
      options: Object.values(INVENTORY_ALLOCATION_STATUS),
      defaultValue: INVENTORY_ALLOCATION_STATUS.PENDING.value,
      required: true,
      index: true,
      hooks: { beforeChange: [defaultStatus] },
      validate: NullableValidator.select,
      admin: {
        description:
          'PENDING: bags committed but not yet delivered; FULFILLED: delivered; CANCELLED: voided',
        position: 'sidebar',
      },
    },

    {
      name: 'allocationId',
      label: 'Allocation ID',
      type: 'text',
      required: true,
      index: true,
      hooks: { beforeChange: [defaultAllocationID] },
      validate: NullableValidator.text,
      admin: {
        description:
          'Unique identifier shared across allocations from the same batch (auto-generated)',
        readOnly: true,
        position: 'sidebar',
      },
    },

    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Optional notes about this allocation',
      },
    },
  ],
};
