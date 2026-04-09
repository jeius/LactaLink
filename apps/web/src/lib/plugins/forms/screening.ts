import { authenticated } from '@/collections/_access-control';
import { createUserField } from '@/fields/userField';
import {
  COLLECTION_GROUP,
  SCREENING_FORM_SLUG,
  SCREENING_FORM_SUBMISSION_SLUG,
} from '@/lib/constants/collections';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { BlocksField, CheckboxField, DateField, Field, NumberField } from 'payload';
import {
  associateOrganizationOrAdmin,
  authenticatedAndPublished,
  organizationOrAdmin,
  submitterOrAdmin,
} from './access';
import {
  defaultValue,
  dynamicOption,
  helperText,
  hidden,
  label,
  name,
  options,
  placeholder,
  required,
  width,
} from './fields';

export const screeningForm = formBuilderPlugin({
  defaultToEmail: 'lactalinkph@gmail.com',
  formOverrides: {
    slug: SCREENING_FORM_SLUG,
    labels: { singular: 'Donor Screening Form', plural: 'Donor Screening Forms' },
    admin: {
      description: 'Manage the donor screening questionnaire. Only admins can modify questions.',
      group: COLLECTION_GROUP.SCREENING,
    },
    versions: {
      drafts: { autosave: { showSaveDraftButton: true }, schedulePublish: true },
      maxPerDoc: 10,
    },
    access: {
      create: organizationOrAdmin,
      read: authenticatedAndPublished,
      update: associateOrganizationOrAdmin,
      delete: associateOrganizationOrAdmin,
    },
    fields: ({ defaultFields }) => {
      const blocksFieldIndex = defaultFields.findIndex(
        (field) => 'name' in field && field.name === 'fields'
      );
      const blocksField = blocksFieldIndex !== -1 ? defaultFields[blocksFieldIndex] : undefined;

      const newBlocksField = blocksField && {
        ...(blocksField as BlocksField),
        label: 'Form Fields',
        interfaceName: 'FormFieldBlocks',
      };

      const sectionFields: Field[] = [
        { name: 'title', label: 'Section Title', type: 'text', required: true },
        { name: 'description', label: 'Section Description', type: 'textarea' },
      ];

      const sectionsField: Field = {
        name: 'sections',
        label: 'Form Sections',
        labels: { singular: 'Form Section', plural: 'Form Sections' },
        interfaceName: 'DonorScreeningFormSections',
        type: 'array',
        fields: newBlocksField ? [...sectionFields, newBlocksField] : sectionFields,
        admin: {
          description:
            'Sections allow you to group related fields together. Each section can have its own title and description.',
        },
      };

      const fields = Array.from(defaultFields);
      if (newBlocksField) {
        fields.splice(
          blocksFieldIndex,
          1,
          {
            ...newBlocksField,
            admin: {
              description:
                'Fields that are not part of any section will be displayed in this area.',
            },
          },
          sectionsField
        );
      }

      return modifyFields(fields);
    },
  },
  formSubmissionOverrides: {
    slug: SCREENING_FORM_SUBMISSION_SLUG,
    labels: { singular: 'Donor Screening Submission', plural: 'Donor Screening Submissions' },
    admin: {
      description: 'Submissions from donors filling out the screening form.',
      group: COLLECTION_GROUP.SCREENING,
    },
    versions: {
      drafts: { autosave: true },
      maxPerDoc: 10,
    },
    access: {
      create: authenticated,
      read: submitterOrAdmin,
      update: submitterOrAdmin,
      delete: () => false,
    },
    fields: ({ defaultFields }) => {
      return [
        ...defaultFields,
        createUserField({ name: 'submittedBy', label: 'Submitted By', required: true }),
        {
          name: 'submittedAt',
          label: 'Submitted At',
          type: 'date',
          required: true,
          admin: { position: 'sidebar', readOnly: true },
        },
      ];
    },
  },
  fields: {
    payment: false,
    country: false,
    state: false,
    message: {
      interfaceName: 'MessageBlockField',
    },
    radio: {
      interfaceName: 'RadioBlockField',
      fields: [
        { type: 'row', fields: [name, label] },
        helperText,
        { type: 'row', fields: [width, defaultValue] },
        required,
        hidden,
        options,
      ],
    },
    checkbox: {
      interfaceName: 'CheckboxBlockField',
      fields: [
        { type: 'row', fields: [name, label] },
        helperText,
        { type: 'row', fields: [width, { ...(defaultValue as CheckboxField), type: 'checkbox' }] },
        required,
        hidden,
      ],
    },
    text: {
      interfaceName: 'TextBlockField',
      fields: [
        { type: 'row', fields: [name, label] },
        { type: 'row', fields: [placeholder, helperText] },
        { type: 'row', fields: [width, defaultValue] },
        required,
        hidden,
      ],
    },
    textarea: {
      interfaceName: 'TextareaBlockField',
      fields: [
        { type: 'row', fields: [name, label] },
        { type: 'row', fields: [placeholder, helperText] },
        { type: 'row', fields: [width, defaultValue] },
        required,
        hidden,
      ],
    },
    date: {
      interfaceName: 'DateBlockField',
      fields: [
        { type: 'row', fields: [name, label] },
        { type: 'row', fields: [placeholder, helperText] },
        { type: 'row', fields: [width, { ...(defaultValue as DateField), type: 'date' }] },
        required,
        hidden,
      ],
    },
    email: {
      interfaceName: 'EmailBlockField',
      fields: [
        { type: 'row', fields: [name, label] },
        { type: 'row', fields: [placeholder, helperText] },
        { type: 'row', fields: [width, defaultValue] },
        required,
        hidden,
      ],
    },
    number: {
      interfaceName: 'NumberBlockField',
      fields: [
        { type: 'row', fields: [name, label] },
        { type: 'row', fields: [placeholder, helperText] },
        { type: 'row', fields: [width, { ...(defaultValue as NumberField), type: 'number' }] },
        required,
        hidden,
      ],
    },
    select: {
      interfaceName: 'SelectBlockField',
      fields: [
        { type: 'row', fields: [name, label] },
        { type: 'row', fields: [placeholder, helperText] },
        { type: 'row', fields: [width, defaultValue] },
        required,
        hidden,
        options,
        ...dynamicOption,
      ],
    },
    'multi-select': {
      //@ts-expect-error - The plugin's types don't currently support this field type, but it is implemented in the plugin code.
      slug: 'multi-select',
      labels: { singular: 'Multi-Select', plural: 'Multi-Select Fields' },
      hasMany: true,
      interfaceName: 'MultiSelectBlockField',
      fields: [
        { type: 'row', fields: [name, label] },
        { type: 'row', fields: [placeholder, helperText] },
        { type: 'row', fields: [width, defaultValue] },
        required,
        hidden,
        options,
        ...dynamicOption,
      ],
    },
  },
});

// #region Helpers
function modifyFields(fields: Field[]): Field[] {
  const newFields = fields.map((field) => {
    if (!('name' in field)) return field;

    const draft = { ...field };

    // Add description to the title field
    if (field.name === 'title') {
      const description =
        'Internal name for this form (e.g., "Standard Donor Screening Form"). This is not visible to donors.';

      if (!draft.admin) {
        draft.admin = { description };
      } else if ('description' in draft.admin) {
        draft.admin.description =
          'Internal name for this form (e.g., "Standard Donor Screening Form"). This is not visible to donors.';
      }
    }

    // Hide fields that are not relevant
    if (['confirmationType', 'confirmationMessage', 'redirect'].includes(field.name)) {
      return null;
    }

    return draft;
  });

  // Add new fields
  newFields.push(
    {
      name: 'hospital',
      type: 'relationship',
      relationTo: 'hospitals',
      label: 'Associated Hospital',
      admin: { position: 'sidebar' },
    },
    {
      name: 'milkbank',
      type: 'relationship',
      relationTo: 'milkBanks',
      label: 'Associated Milk Bank',
      admin: { position: 'sidebar' },
    }
  );

  return newFields.filter((field) => field !== null);
}
// #endregion
