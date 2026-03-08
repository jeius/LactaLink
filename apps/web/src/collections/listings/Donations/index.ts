import { deliveryTab } from '@/fields/deliveryTab';
import { createUserField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants';
import { NullableValidator } from '@lactalink/agents/payload';
import { COLLECTION_MODES, STORAGE_TYPES } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../../_access-control';
import { recipientField, timeStampFields, titleField } from '../_fields';
import { statusField } from '../_fields/statusField';
import { afterChange } from '../_hooks/afterChange';
import { afterDelete } from '../_hooks/afterDelete';
import { afterRead } from '../_hooks/afterRead';
import { donationsEndpoints } from './endpoints';
import { filterMilkBagsOptions } from './filterOptions';
import { beforeValidate } from './hooks/beforeValidate';

export const Donations: CollectionConfig<'donations'> = {
  slug: 'donations',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionCreatorOrAdmin,
    delete: collectionCreatorOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'title',
    defaultColumns: ['donor', 'volume', 'remainingVolume', 'status', 'createdAt'],
  },
  hooks: {
    beforeValidate: [beforeValidate],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
    afterRead: [afterRead],
  },
  endpoints: donationsEndpoints,
  fields: [
    titleField({
      description: 'Title of the donation record. (Auto-generated based on donor and volume)',
    }),

    ...timeStampFields(),

    createUserField({ name: 'createdBy', required: true }),

    {
      type: 'row',
      fields: [
        {
          name: 'donor',
          type: 'relationship',
          relationTo: 'individuals',
          required: true,
          admin: {
            description: 'The person donating the milk',
            width: '50%',
          },
        },

        recipientField({
          description:
            'Intended recipient for this donation (optional - leave empty for general donation)',
          width: '50%',
        }),

        {
          name: 'volume',
          label: 'Total Volume (mL)',
          type: 'number',
          defaultValue: 20,
          required: true,
          validate: NullableValidator.number,
          admin: {
            description: 'Total volume of milk donated.',
            readOnly: true,
            width: '50%',
          },
        },

        {
          name: 'remainingVolume',
          label: 'Remaining Volume (mL)',
          type: 'number',
          defaultValue: 20,
          required: true,
          validate: NullableValidator.number,
          admin: {
            description: 'Volume still available for allocation',
            readOnly: true,
            width: '50%',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [statusField('Donation Status')],
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            {
              name: 'details',
              label: 'Milk Details',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'storageType',
                      label: 'Storage Type',
                      type: 'select',
                      required: true,
                      admin: {
                        description: 'Type of storage for the milk',
                        width: '50%',
                      },
                      options: Object.values(STORAGE_TYPES),
                    },
                    {
                      name: 'collectionMode',
                      label: 'Collection Mode',
                      type: 'select',
                      required: true,
                      admin: {
                        description: 'How the milk was collected',
                        width: '50%',
                      },
                      options: Object.values(COLLECTION_MODES),
                    },
                  ],
                },
                {
                  name: 'bags',
                  label: 'Milk Bags',
                  type: 'relationship',
                  relationTo: 'milkBags',
                  required: true,
                  hasMany: true,
                  filterOptions: filterMilkBagsOptions,
                  validate: (value) => {
                    if (!value || value.length === 0) {
                      return 'At least one milk bag must be selected';
                    }
                    return true;
                  },
                  admin: {
                    description: 'Select the milk bags used for this donation',
                  },
                },
                {
                  type: 'upload',
                  name: 'milkSample',
                  label: 'Milk Sample',
                  relationTo: 'images',
                  hasMany: true,
                  maxRows: 5,
                  admin: {
                    description: 'Upload images of the milk sample',
                  },
                },
                {
                  name: 'notes',
                  type: 'textarea',
                  admin: {
                    description: 'Additional notes or special instructions from donor',
                  },
                },
              ],
            },
          ],
        },

        deliveryTab(),

        {
          label: 'Read Tracking',
          fields: [
            {
              name: 'reads',
              label: 'Read by Users',
              type: 'join',
              collection: 'donation-reads',
              on: 'donation',
              admin: {
                description: 'Users who have seen this donation',
                defaultColumns: ['user', 'createdAt'],
              },
            },
          ],
        },

        {
          label: 'Transactions',
          fields: [
            {
              name: 'transactions',
              label: 'Transactions',
              type: 'join',
              collection: 'transactions',
              on: 'donation',
              admin: {
                description: 'Transactions associated with this donation',
                defaultColumns: [
                  'transactionNumber',
                  'request',
                  'status',
                  'matchedVolume',
                  'createdAt',
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
