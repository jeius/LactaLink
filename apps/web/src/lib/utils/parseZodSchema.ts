import { CollectionSlug, GlobalSlug, PayloadRequest, TypeWithID, ValidationError } from 'payload';
import z from 'zod';

/**
 * Parses and validates input data against a provided Zod schema.
 * If validation fails, it throws a Payload ValidationError with detailed
 * error information.
 *
 * @param schema - The Zod schema to validate against.
 * @param data - The input data to validate.
 * @param validationOptions - Optional context for error reporting.
 * @returns The validated data if successful.
 * @throws A `ValidationError` containing details of the validation errors if validation fails.
 */
export function parseZodSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
  validationOptions: {
    collection?: CollectionSlug;
    global?: GlobalSlug;
    id?: TypeWithID['id'];
    req?: PayloadRequest;
  } = {}
): T {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  } else {
    const error = z.flattenError(result.error);
    const defaultMessage = 'Invalid input data';

    throw new ValidationError(
      {
        ...validationOptions,
        errors: Object.entries(error.fieldErrors).map(([field, messages]) => ({
          path: field,
          label: field,
          message: Array.isArray(messages) ? (messages[0] ?? defaultMessage) : defaultMessage,
        })),
      },
      validationOptions?.req?.t
    );
  }
}
