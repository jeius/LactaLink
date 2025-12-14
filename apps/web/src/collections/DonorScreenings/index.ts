import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { formVersionField } from './fields';
import {
  generateReviewDetails,
  generateSubmittedAt,
  generateSubmittedBy,
} from './hooks/beforeChange';

export enum DONOR_SCREENING_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

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
    beforeChange: [
      generateCreatedBy,
      generateSubmittedBy,
      generateSubmittedAt,
      generateReviewDetails,
    ],
  },
  fields: [
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'individuals',
      required: true,
      admin: {
        description: 'The individual who submitted this screening response',
        position: 'sidebar',
        readOnly: true,
      },
    },

    createdByField,

    {
      name: 'status',
      label: 'Review Status',
      type: 'select',
      options: [
        { label: 'Pending Review', value: DONOR_SCREENING_STATUS.PENDING },
        { label: 'Approved', value: DONOR_SCREENING_STATUS.APPROVED },
        { label: 'Rejected', value: DONOR_SCREENING_STATUS.REJECTED },
        { label: 'Needs Further Review', value: DONOR_SCREENING_STATUS.NEEDS_REVIEW },
      ],
      enumName: 'enum_donor_screening_status',
      defaultValue: DONOR_SCREENING_STATUS.PENDING,
      required: true,
      admin: {
        description: 'The current review status of this screening response',
        position: 'sidebar',
      },
    },

    formVersionField,

    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When this screening was submitted',
        position: 'sidebar',
        readOnly: true,
        date: {
          displayFormat: 'MMM dd, yyyy h:mm a',
        },
      },
    },

    {
      name: 'reviewedAt',
      type: 'date',
      admin: {
        description: 'When this screening was reviewed by an admin',
        position: 'sidebar',
        date: {
          displayFormat: 'MMM dd, yyyy h:mm a',
        },
        condition: (data) =>
          data.status === DONOR_SCREENING_STATUS.APPROVED ||
          data.status === DONOR_SCREENING_STATUS.REJECTED,
      },
    },

    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'The admin user who reviewed this screening',
        position: 'sidebar',
        readOnly: true,
        condition: (data) =>
          data.status === DONOR_SCREENING_STATUS.APPROVED ||
          data.status === DONOR_SCREENING_STATUS.REJECTED,
      },
    },

    {
      name: 'reviewNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes from the reviewer (not visible to user)',
        condition: (data) =>
          data.status === DONOR_SCREENING_STATUS.APPROVED ||
          data.status === DONOR_SCREENING_STATUS.REJECTED ||
          data.status === DONOR_SCREENING_STATUS.NEEDS_REVIEW,
      },
    },

    {
      name: 'responses',
      type: 'array',
      label: 'User Responses',
      required: true,
      admin: {
        description: "The user's answers to each question",
        // readOnly: true,
      },
      fields: [
        {
          name: 'sectionIndex',
          label: 'Section',
          type: 'number',
          required: true,
          admin: {
            description: 'Index of the section this answer belongs to',
          },
        },
        {
          name: 'questionIndex',
          type: 'number',
          required: true,
          admin: {
            description: 'Index of the question within the section',
          },
        },
        {
          name: 'questionType',
          type: 'select',
          options: [
            { label: 'Text', value: 'text-question' },
            { label: 'Textarea', value: 'textarea-question' },
            { label: 'Radio', value: 'radio-question' },
            { label: 'Checkbox', value: 'checkbox-question' },
          ],
          enumName: 'enum_screening_question_type',
          required: true,
          admin: {
            description: 'The type of question that was answered',
          },
        },
        {
          name: 'question',
          type: 'text',
          required: true,
          admin: {
            description: 'The question text (snapshot from the form version)',
          },
        },
        {
          name: 'answer',
          type: 'json',
          required: true,
          admin: {
            description: "The user's answer (format varies by question type)",
          },
        },
      ],
    },

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
          name: 'ipAddress',
          type: 'text',
          admin: {
            description: 'IP address of the submitter',
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
};
