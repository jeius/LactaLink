import { createdByField } from '@/fields/createdByField';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { CHOICE_TYPE, SCREENING_STATUS } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { formVersionField } from './fields';
import {
  generateReviewDetails,
  generateSubmittedAt,
  generateSubmittedBy,
} from './hooks/beforeChange';

const PENDING = SCREENING_STATUS.PENDING.value;
const APPROVED = SCREENING_STATUS.APPROVED.value;
const REJECTED = SCREENING_STATUS.REJECTED.value;
const NEEDS_REVIEW = SCREENING_STATUS.NEEDS_REVIEW.value;

export const DonorScreenings: CollectionConfig<'donor-screenings'> = {
  slug: 'donor-screenings',
  labels: {
    singular: 'Donor Screening',
    plural: 'Donor Screenings',
  },
  admin: {
    group: COLLECTION_GROUP.SCREENING,
    useAsTitle: 'submittedBy',
    defaultColumns: ['submittedBy', 'status', 'formVersion', 'submittedAt', 'reviewedAt'],
    description: 'User responses to the donor screening questionnaire',
  },
  access: {
    create: authenticated,
    read: collectionCreatorOrAdmin,
    update: admin,
    delete: admin,
  },
  hooks: {
    beforeChange: [generateReviewDetails],
  },
  fields: [
    createdByField,
    formVersionField,

    {
      name: 'status',
      label: 'Review Status',
      type: 'select',
      options: Object.values(SCREENING_STATUS),
      enumName: 'enum_donor_screening_status',
      defaultValue: PENDING,
      required: true,
      admin: {
        description: 'The current review status of this screening response',
        position: 'sidebar',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'submittedBy',
          type: 'relationship',
          relationTo: 'individuals',
          required: true,
          hasMany: false,
          validate: () => true,
          hooks: { beforeChange: [generateSubmittedBy] },
          admin: {
            description: 'The individual who submitted this screening response',
            position: 'sidebar',
            readOnly: true,
            width: '50%',
          },
        },

        {
          name: 'submittedAt',
          type: 'date',
          required: true,
          hooks: { beforeChange: [generateSubmittedAt] },
          admin: {
            description: 'When this screening was submitted',
            position: 'sidebar',
            readOnly: true,
            width: '50%',
            date: {
              displayFormat: 'MMM dd, yyyy h:mm a',
            },
          },
        },
      ],
    },

    {
      type: 'row',
      admin: { condition: (data) => data.status === APPROVED || data.status === REJECTED },
      fields: [
        {
          name: 'reviewedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'The admin user who reviewed this screening',
            position: 'sidebar',
            readOnly: true,
            width: '50%',
          },
        },

        {
          name: 'reviewedAt',
          type: 'date',
          admin: {
            description: 'When this screening was reviewed by an admin',
            position: 'sidebar',
            width: '50%',
            date: {
              displayFormat: 'MMM dd, yyyy h:mm a',
            },
          },
        },
      ],
    },

    {
      name: 'reviewNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes from the reviewer (not visible to user)',
        condition: (data) =>
          data.status === APPROVED || data.status === REJECTED || data.status === NEEDS_REVIEW,
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Responses',
          fields: [
            {
              name: 'responses',
              type: 'array',
              label: 'User Responses',
              required: true,
              admin: {
                description: "The user's answers to each question",
                readOnly: true,
              },
              fields: [
                {
                  name: 'section',
                  label: 'Section',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Section of the screening form this answer belongs to',
                  },
                },

                {
                  name: 'questionType',
                  label: 'Type of Question',
                  type: 'select',
                  enumName: 'enum_choice_type',
                  required: true,
                  options: Object.values(CHOICE_TYPE),
                },

                {
                  name: 'question',
                  type: 'text',
                  required: true,
                },

                {
                  name: 'answer',
                  type: 'text',
                  required: true,
                  admin: {
                    description: "The user's answer to the question",
                  },
                },

                {
                  name: 'file',
                  label: 'Uploaded File',
                  type: 'upload',
                  relationTo: 'screening-files',
                  admin: {
                    description:
                      'If the question required a file upload, this is the uploaded file',
                  },
                },
              ],
            },
          ],
        },

        {
          label: 'Metadata',
          fields: [
            {
              name: 'metadata',
              type: 'group',
              label: 'Submission Metadata',
              admin: {
                description: 'Additional information about the submission',
              },
              fields: [
                {
                  name: 'deviceInfo',
                  type: 'text',
                  admin: {
                    description: 'Device/platform used for submission',
                  },
                },
                {
                  name: 'timeToComplete',
                  type: 'number',
                  admin: {
                    description: 'Time taken to complete the form (in seconds)',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
