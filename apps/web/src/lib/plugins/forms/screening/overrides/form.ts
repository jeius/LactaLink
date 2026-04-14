import { NullableValidator } from '@lactalink/agents/payload';
import { toKebabCase } from '@lactalink/utilities/formatters';
import type { BlocksField, Field } from 'payload';

export function formFieldsOverrides(defaultFields: Field[]): Field[] {
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

  // Replace the original blocksField in the fields array with the new one that includes sections
  if (newBlocksField) {
    fields.splice(
      blocksFieldIndex,
      1,
      {
        ...newBlocksField,
        admin: {
          description: 'Fields that are not part of any section will be displayed in this area.',
        },
      },
      sectionsField
    );
  }

  // Modify individual field configurations for different field types
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
      name: 'organization',
      type: 'relationship',
      relationTo: ['hospitals', 'milkBanks'],
      label: 'Associated Hospital or Milk Bank',
      admin: { position: 'sidebar' },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      label: 'Use as Default Form?',
      admin: {
        condition: (_, siblingData) => !siblingData?.organization,
        position: 'sidebar',
        description:
          'If checked, this form will be used as the default for new donors without an associated hospital/milkbank.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Form Identifier',
      required: true,
      index: true,
      hasMany: false,
      validate: NullableValidator.text,
      hooks: {
        beforeChange: [
          ({ data, value }) => {
            if (!value || value.trim() === '') {
              return data?.title
                ? toKebabCase(data.title)
                : `donor-screening-form-${Date.now().toString()}`;
            }
            return toKebabCase(value);
          },
        ],
      },
      admin: {
        position: 'sidebar',
        description:
          'Unique identifier for this form used in the URL (e.g., "standard-donor-screening")',
      },
    }
  );

  const filteredFields = newFields.filter((field) => field !== null);

  return [
    {
      type: 'tabs',
      tabs: [
        { label: 'Form', fields: filteredFields },
        {
          label: 'Submissions',
          fields: [
            {
              name: 'submissions',
              label: 'Form Submissions',
              type: 'join',
              collection: 'donor-screening-submissions',
              on: 'form',
              admin: {
                defaultColumns: ['submittedBy', 'submittedAt', 'isApproved'],
                description: 'View submissions received for this form.',
                allowCreate: false,
              },
              where: { _status: { equals: 'published' } },
            },
          ],
        },
      ],
    },
  ];
}
