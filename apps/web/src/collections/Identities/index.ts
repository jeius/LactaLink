import { createdByField } from '@/fields/createdByField';
import { ownerField } from '@/fields/ownerField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { ID_STATUS, ID_TYPES } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { generateUpdatedBy } from './hooks/generateUpdatedBy';
import { updateOwnerOnApprove } from './hooks/update';
import { verifyAfterCreate } from './hooks/verifyAfterCreate';

export const Identities: CollectionConfig<'identities'> = {
  slug: 'identities',
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'idNumber',
    defaultColumns: ['givenName', 'familyName', 'idType', 'status'],
  },
  access: {
    create: authenticated,
    read: collectionCreatorOrAdmin,
    update: admin,
    delete: admin,
  },
  hooks: {
    beforeChange: [generateCreatedBy, generateOwner, generateUpdatedBy],
    afterChange: [verifyAfterCreate, updateOwnerOnApprove],
  },
  fields: [
    createdByField,
    ownerField,
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'The admin user who last updated this record.',
        readOnly: true,
        position: 'sidebar',
      },
    },

    {
      name: 'idType',
      label: 'ID Type',
      type: 'select',
      options: Object.values(ID_TYPES),
      required: true,
      admin: {
        description: 'The type of ID being submitted for verification.',
        placeholder: 'Select ID Type',
      },
    },
    {
      name: 'status',
      label: 'Verification Status',
      type: 'select',
      options: Object.values(ID_STATUS),
      defaultValue: ID_STATUS.PENDING.value,
      required: true,
      admin: {
        description: 'The current verification status of the ID.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'idImage',
          label: 'ID Image',
          type: 'upload',
          relationTo: 'identity-images',
          required: true,
          admin: {
            description: 'Image of the submitted ID (e.g., passport, driver’s license).',
            width: '50%',
            readOnly: true,
          },
        },
        {
          name: 'refImage',
          label: 'Reference Image',
          type: 'upload',
          relationTo: 'identity-images',
          required: true,
          admin: {
            description: 'Clear image of the user holding the ID next to their face.',
            width: '50%',
            readOnly: true,
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'givenName',
          label: 'Given Name',
          type: 'text',
          required: true,
          admin: {
            description: 'The first name of the user as it appears on the ID.',
            placeholder: 'Enter Given Name',
            width: '50%',
          },
        },
        {
          name: 'middleName',
          label: 'Middle Name',
          type: 'text',
          required: false,
          admin: {
            description: 'The middle name of the user as it appears on the ID (if applicable).',
            placeholder: 'Enter Middle Name',
            width: '50%',
          },
        },
        {
          name: 'familyName',
          label: 'Family Name',
          type: 'text',
          required: true,
          admin: {
            description: 'The last name of the user as it appears on the ID.',
            placeholder: 'Enter Family Name',
            width: '50%',
          },
        },
        {
          name: 'suffix',
          label: 'Suffix',
          type: 'text',
          required: false,
          admin: {
            description: 'The suffix of the user as it appears on the ID (if applicable).',
            placeholder: 'Enter Suffix (e.g., Jr., Sr., III)',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea',
      required: false,
      admin: {
        description: 'The address of the user as it appears on the ID.',
        placeholder: 'Enter Address',
        rows: 3,
      },
    },

    {
      name: 'idNumber',
      label: 'ID Number',
      type: 'text',
      required: true,
      admin: {
        description: 'The identification number as it appears on the ID.',
        placeholder: 'Enter ID Number',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'issueDate',
          label: 'Issue Date',
          type: 'date',
          required: false,
          admin: {
            description: 'The date when the ID was issued (if available).',
            placeholder: 'Select Issue Date',
            date: {
              displayFormat: 'MMM DD, YYYY',
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'expirationDate',
          label: 'Expiration Date',
          type: 'date',
          required: false,
          admin: {
            description: 'The date when the ID will expire (if available).',
            placeholder: 'Select Expiration Date',
            date: {
              displayFormat: 'MMM DD, YYYY',
              pickerAppearance: 'dayOnly',
            },
          },
        },
      ],
    },
  ],
};
