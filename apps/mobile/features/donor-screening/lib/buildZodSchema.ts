import { z } from 'zod';

import { DonorScreeningFormField } from '@lactalink/types/collections';

/**
 * Builds a Zod schema from an array of form fields, applying validation rules
 * based on field types and their `required` property.
 *
 * @param fields - An array of form fields, either top-level or within a section.
 * @returns An object mapping field names to their corresponding Zod schema definitions.
 */
export function buildZodSchema(fields: DonorScreeningFormField[]) {
  return fields.reduce((schema, field) => {
    switch (field.blockType) {
      case 'checkbox':
        return z.object({
          ...schema.shape,
          [field.name.trim()]: field.required
            ? z.boolean('Required')
            : z.boolean().optional().nullable(),
        });
      case 'email':
        return z.object({
          ...schema.shape,
          [field.name.trim()]: field.required
            ? z.email('Invalid email address')
            : z.email('Invalid email address').optional().nullable(),
        });
      case 'text':
      case 'textarea':
        return z.object({
          ...schema.shape,
          [field.name.trim()]: field.required
            ? z.string().nonempty('Required')
            : z.string().optional().nullable(),
        });
      case 'select':
      case 'radio':
        return z.object({
          ...schema.shape,
          [field.name.trim()]: field.required
            ? z.string('Please select one option').nonempty('Required')
            : z.string().optional().nullable(),
        });
      case 'multi-select':
        return z.object({
          ...schema.shape,
          [field.name.trim()]: field.required
            ? z.array(z.string('Required')).min(1, 'Required')
            : z.array(z.string()).optional().nullable(),
        });
      case 'date':
        return z.object({
          ...schema.shape,
          [field.name.trim()]: field.required
            ? z.string('Required').nonempty('Required')
            : z.string().optional().nullable(),
        });
      case 'number':
        return z.object({
          ...schema.shape,
          [field.name.trim()]: field.required
            ? z.number('Required')
            : z.number().optional().nullable(),
        });
      default:
        // 'message' blockType has no `name` and is display-only — skip it
        return schema;
    }
  }, z.object({}));
}
