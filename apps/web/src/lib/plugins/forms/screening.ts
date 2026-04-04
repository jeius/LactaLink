import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';

export const screeningForm = formBuilderPlugin({
  formOverrides: {
    slug: 'donor-screening-form',
    labels: { singular: 'Donor Screening Form', plural: 'Donor Screening Forms' },
    admin: {
      description: 'Manage the donor screening questionnaire. Only admins can modify questions.',
      group: COLLECTION_GROUP.SCREENING,
    },
    versions: {
      drafts: { autosave: true, schedulePublish: true },
      maxPerDoc: 20,
    },
    fields: ({ defaultFields }) =>
      defaultFields.map((field) => {
        if ('name' in field && field.name !== 'title') return field;
        const draft = { ...field };

        const description =
          'Internal name for this form (e.g., "Standard Donor Screening Form"). This is not visible to donors.';

        if (!draft.admin) {
          draft.admin = { description };
        } else if ('description' in draft.admin) {
          draft.admin.description =
            'Internal name for this form (e.g., "Standard Donor Screening Form"). This is not visible to donors.';
        }

        return draft;
      }),
  },
  formSubmissionOverrides: {
    slug: 'donor-screening-submissions',
    labels: { singular: 'Donor Screening Submission', plural: 'Donor Screening Submissions' },
    admin: {
      description: 'Submissions from donors filling out the screening form.',
      group: COLLECTION_GROUP.SCREENING,
    },
  },
  fields: {
    payment: false,
    country: false,
    state: false,
    radio: true,
    checkbox: true,
    select: true,
    text: true,
    textarea: true,
    date: true,
    email: true,
    number: true,
    message: true,
  },
  defaultToEmail: 'lactalinkph@gmail.com',
});
