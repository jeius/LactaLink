import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { fields, formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { Field } from 'payload';

const defaultSelectFields =
  typeof fields.select === 'function'
    ? Array.from(fields.select().fields)
    : fields.select
      ? Array.from(fields.select.fields)
      : undefined;

const withOtherField: Field[] = [
  {
    name: 'withOther',
    label: 'With Other Option',
    type: 'checkbox',
    admin: {
      description: 'If checked, an "Other" option will be added to the question.',
      width: '30%',
    },
  },
  {
    type: 'row',
    admin: { condition: (_, siblingData) => !!siblingData?.withOther },
    fields: [
      {
        name: 'otherLabel',
        label: 'Label',
        type: 'text',
        defaultValue: 'Other',
        admin: { width: '50%' },
      },
      {
        name: 'otherPlaceholder',
        label: 'Placeholder',
        type: 'text',
        defaultValue: 'Please specify',
        admin: { width: '50%' },
      },
    ],
  },
];

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
    text: true,
    textarea: true,
    date: true,
    email: true,
    number: true,
    message: true,
    select: {
      ...fields.select,
      fields: defaultSelectFields ? [...defaultSelectFields, ...withOtherField] : undefined,
    },
    'multi-select': {
      //@ts-expect-error - The plugin's types don't currently support this field type, but it is implemented in the plugin code.
      slug: 'multi-select',
      labels: { singular: 'Multi-Select', plural: 'Multi-Select' },
      hasMany: true,
      fields: defaultSelectFields ? [...defaultSelectFields, ...withOtherField] : undefined,
    },
  },
  defaultToEmail: 'lactalinkph@gmail.com',
});
