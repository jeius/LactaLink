import { COLLECTION_GROUP } from '@/lib/constants';
import { GlobalConfig } from 'payload';
import { admin, authenticated } from '../collections/_access-control';

export const DonorScreeningForm: GlobalConfig<'donor-screening-form'> = {
  slug: 'donor-screening-form',
  label: 'Donor Screening Questionnaire',
  access: {
    read: authenticated,
    update: admin,
  },
  admin: {
    description: 'Manage the donor screening questionnaire. Only admins can modify questions.',
    group: COLLECTION_GROUP.SCREENING,
  },
  versions: {
    drafts: { autosave: true, schedulePublish: true },
    max: 20,
  },
  fields: [
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description or instructions for the screening form',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this questionnaire is currently active',
        position: 'sidebar',
      },
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Form Sections',
      required: true,
      minRows: 1,
      defaultValue: [],
      admin: {
        description: 'Organize questions into logical sections',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'sectionTitle',
          type: 'text',
          required: true,
          admin: {
            description: 'Title of this section (e.g., "Medical History", "Lifestyle")',
          },
        },
        {
          name: 'sectionDescription',
          type: 'textarea',
          admin: {
            description: 'Optional description or instructions for this section',
          },
        },
        {
          name: 'questions',
          label: 'Questions',
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            {
              name: 'questions',
              type: 'blocks',
              label: 'Questions',
              required: true,
              minRows: 1,
              admin: {
                description: 'Add questions to this section',
                initCollapsed: false,
              },
              blockReferences: ['checkbox-question', 'radio-question', 'text-question'],
              blocks: [],
            },
          ],
        },
      ],
    },
  ],
};
