import { authenticated } from '@/collections/_access-control';
import {
  COLLECTION_GROUP,
  SCREENING_FORM_SLUG,
  SCREENING_FORM_SUBMISSION_SLUG,
} from '@/lib/constants/collections';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { CheckboxField, DateField, NumberField } from 'payload';
import {
  associateOrganizationOrAdmin,
  authenticatedAndPublished,
  organizationOrAdmin,
  submitterOrAdmin,
} from './access';
import {
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
} from './fields';

export const screeningForm = formBuilderPlugin({
  defaultToEmail: 'lactalinkph@gmail.com',
  formOverrides: {
    slug: SCREENING_FORM_SLUG,
    labels: { singular: 'Donor Screening Form', plural: 'Donor Screening Forms' },
    admin: {
      description: 'Manage the donor screening questionnaire. Only admins can modify questions.',
      group: COLLECTION_GROUP.SCREENING,
      defaultColumns: ['title', 'fields', 'sections', '_status'],
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
    fields: ({ defaultFields }) => formFieldsOverrides(defaultFields),
  },
  formSubmissionOverrides: {
    slug: SCREENING_FORM_SUBMISSION_SLUG,
    labels: { singular: 'Donor Screening Submission', plural: 'Donor Screening Submissions' },
    admin: {
      description: 'Submissions from donors filling out the screening form.',
      group: COLLECTION_GROUP.SCREENING,
      useAsTitle: 'submitterEmail',
      defaultColumns: ['submitterEmail', 'form', 'submittedAt', '_status'],
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
    fields: ({ defaultFields }) => formSubmissionFieldsOverrides(defaultFields),
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
