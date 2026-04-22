import { createUserField } from '@/fields/userField';
import type { ArrayField, Field, TextField } from 'payload';

export function formSubmissionFieldsOverrides(defaultFields: Field[]): Field[] {
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
      type: 'text',
      virtual: 'submittedBy.email',
      admin: { hidden: true },
    },
    {
      name: 'submitterName',
      type: 'text',
      virtual: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'submittedAt',
      label: 'Submitted At',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      type: 'row',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'isApproved',
          label: 'Approved',
          type: 'checkbox',
          admin: { width: '50%' },
        },
        {
          name: 'isRejected',
          label: 'Rejected',
          type: 'checkbox',
          admin: { width: '50%' },
        },
      ],
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
          admin: { width: '50%' },
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
          admin: { width: '50%' },
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
                if (siblingData?.isRejected === true && (!value || value.trim() === '')) {
                  return new Date().toISOString();
                }
                return value;
              },
            ],
          },
          admin: { width: '50%' },
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
          admin: { width: '50%' },
        },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_, siblingData) => siblingData?.isRejected === true,
      },
    },
  ];
}
