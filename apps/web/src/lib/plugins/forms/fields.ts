import { createUserField } from '@/fields/userField';
import { NullableValidator } from '@lactalink/agents/payload';
import { toKebabCase } from '@lactalink/utilities/formatters';
import type { ArrayField, BlocksField, Field, TextField } from 'payload';

const name: Field = {
  name: 'name',
  label: 'Name',
  type: 'text',
  required: true,
  admin: {
    width: '50%',
    description: 'Unique identifier for this question and must be camelCase (e.g., "emailAddress")',
  },
};

const label: Field = {
  name: 'label',
  label: 'Label',
  type: 'text',
  required: true,
  admin: {
    width: '50%',
    description: 'The text that users will see',
  },
};

const required: Field = {
  name: 'required',
  label: 'Required',
  type: 'checkbox',
  admin: {
    width: '50%',
    description: 'Whether this field must be filled out',
  },
};

const placeholder: Field = {
  name: 'placeholder',
  label: 'Placeholder',
  type: 'text',
  admin: {
    width: '50%',
    description: 'Example text shown inside the field before user input (e.g., "Enter your email")',
  },
};

const helperText: Field = {
  name: 'helperText',
  label: 'Helper Text',
  type: 'text',
  admin: {
    width: '50%',
    description:
      'Additional guidance shown below the field (e.g., "We will never share your email.")',
  },
};

const defaultValue: Field = {
  name: 'defaultValue',
  label: 'Default Value',
  type: 'text',
  admin: {
    width: '50%',
    description: 'Pre-filled value for this field',
  },
};

const width: Field = {
  name: 'width',
  label: 'Field Width',
  type: 'select',
  defaultValue: 'full',
  enumName: 'enum_field_width',
  interfaceName: 'FieldWidth',
  options: [
    { value: 'full', label: '100%' },
    { value: '3/4', label: '75%' },
    { value: '2/3', label: '66%' },
    { value: '1/2', label: '50%' },
    { value: '1/3', label: '33%' },
    { value: '1/4', label: '25%' },
  ],
  admin: {
    width: '50%',
    description: 'Width of the field in the form layout.',
  },
};

const hidden: Field = {
  name: 'hidden',
  label: 'Hidden Field?',
  type: 'checkbox',
  admin: {
    width: '50%',
    description: 'If checked, this field will not be visible to users filling out the form.',
  },
};

const options: Field = {
  name: 'options',
  label: 'Options',
  type: 'array',
  required: true,
  fields: [
    { name: 'value', label: 'Option Value', type: 'text', required: true, admin: { width: '50%' } },
    { name: 'label', label: 'Option Label', type: 'text', required: true, admin: { width: '50%' } },
  ],
  admin: {
    description: 'The options available for select, multi-select, or radio fields.',
  },
};

const dynamicOption: Field[] = [
  {
    name: 'withDynamicOption',
    label: 'With Dynamic Option?',
    type: 'checkbox',
    admin: {
      description: 'If checked, a user-defined option will be added to the options.',
    },
  },
  {
    type: 'row',
    admin: { condition: (_, siblingData) => !!siblingData?.withDynamicOption },
    fields: [
      {
        name: 'dynamicOptionLabel',
        label: 'Label',
        type: 'text',
        defaultValue: 'Other',
        admin: {
          width: '50%',
          description: 'The label for the user-defined option (e.g., "Other")',
        },
      },
      {
        name: 'dynamicOptionPlaceholder',
        label: 'Placeholder',
        type: 'text',
        defaultValue: 'Please specify',
        admin: {
          width: '50%',
          description: 'The placeholder for the user-defined option input (e.g., "Please specify")',
        },
      },
    ],
  },
];

function formFieldsOverrides(defaultFields: Field[]): Field[] {
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
            },
          ],
        },
      ],
    },
  ];
}

function formSubmissionFieldsOverrides(defaultFields: Field[]): Field[] {
  const fields = Array.from(defaultFields);

  const submissionDataFieldIndex = fields.findIndex(
    (field) => 'name' in field && field.name === 'submissionData'
  );

  const submissionDataField =
    submissionDataFieldIndex !== -1 ? (fields[submissionDataFieldIndex] as ArrayField) : undefined;

  if (submissionDataField) {
    fields.splice(submissionDataFieldIndex, 1, {
      ...submissionDataField,
      fields: [
        ...submissionDataField.fields.map((field) => ({
          ...(field as TextField),
          admin: { hidden: true },
        })),
        {
          name: 'fieldLabel',
          label: 'Field',
          type: 'text',
          required: true,
          admin: {
            readOnly: true,
            description: 'The label of the form field this answer corresponds to.',
          },
        },
        {
          name: 'valueLabel',
          label: 'Answer',
          type: 'textarea',
          required: true,
          admin: {
            readOnly: true,
            description: "The value of the donor's answer in a human-readable format.",
          },
        },
      ],
    });
  }

  return [
    ...fields,
    createUserField({
      name: 'submittedBy',
      label: 'Submitted By',
      required: true,
      admin: { position: 'sidebar', description: 'The user who submitted this form.' },
    }),
    {
      name: 'submitterEmail',
      label: 'Submitted By',
      type: 'text',
      virtual: 'submittedBy.email',
      admin: { hidden: true },
    },
    {
      name: 'submittedAt',
      label: 'Submitted At',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'isApproved',
      label: 'Approved?',
      type: 'checkbox',
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'approvedAt',
          label: 'Approved At',
          type: 'date',
          hooks: {
            beforeChange: [
              ({ value, siblingData }) => {
                if (siblingData?.isApproved === true && (!value || value.trim() === '')) {
                  return new Date().toISOString();
                }
                return value;
              },
            ],
          },
        },
        {
          name: 'approvedBy',
          label: 'Approved By',
          type: 'relationship',
          relationTo: 'users',
          hooks: {
            beforeChange: [
              ({ value, req }) => {
                if (req.user && !value?.trim()) {
                  return req.user.id;
                }
                return value;
              },
            ],
          },
        },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_, siblingData) => siblingData?.isApproved === true,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rejectedAt',
          label: 'Rejected At',
          type: 'date',
          hooks: {
            beforeChange: [
              ({ value, siblingData }) => {
                if (siblingData?.isApproved === false && (!value || value.trim() === '')) {
                  return new Date().toISOString();
                }
                return value;
              },
            ],
          },
        },
        {
          name: 'rejectedBy',
          label: 'Rejected By',
          type: 'relationship',
          relationTo: 'users',
          hooks: {
            beforeChange: [
              ({ value, req }) => {
                if (req.user && !value?.trim()) {
                  return req.user.id;
                }
                return value;
              },
            ],
          },
        },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_, siblingData) => siblingData?.isApproved === false,
      },
    },
  ];
}

export {
  defaultValue,
  dynamicOption,
  formFieldsOverrides,
  formSubmissionFieldsOverrides,
  helperText,
  hidden,
  label,
  name,
  options,
  placeholder,
  required,
  width,
};
