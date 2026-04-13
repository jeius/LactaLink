import { DonorScreeningFormField } from '@lactalink/types/collections';

import { type DonorScreeningSubmission } from '@lactalink/types/payload-generated-types';
import { formatDate } from './formatters';

type ParsedFieldValue = string | number | boolean | string[];

export class DonorScreeningSubmissionData {
  /**
   * Parses raw submission data from a {@link DonorScreeningSubmission} into typed field values
   * suitable for populating React Hook Form default values.
   *
   * Fields not present in `data` are omitted from the result.
   *
   * @param data - The `submissionData` array from a `DonorScreeningSubmission`.
   * @returns A record mapping field names to their coerced typed values.
   */
  static parse(data: { field: string; value: string }[]) {
    return data.reduce(
      (acc, { field, value }) => {
        try {
          acc[field] = JSON.parse(value);
        } catch {}
        return acc;
      },
      {} as Record<string, ParsedFieldValue>
    );
  }

  /**
   * Transforms a record of field values into the format expected for submission to the API.
   *
   * Each entry in the resulting array has a `field` corresponding to the field name, and a `value`
   * which is a JSON string representation of the field value.
   *
   * @param values - A record mapping field names to their values.
   * @returns An array of objects each containing a `field` and its corresponding JSON stringified `value`.
   */
  static transform(
    values: Record<string, unknown>,
    fields: DonorScreeningFormField[]
  ): NonNullable<DonorScreeningSubmission['submissionData']> {
    return fields.reduce(
      (acc, field) => {
        if (field.blockType === 'message') return acc; // Skip message fields as they don't have values

        const value = values[field.name];
        if (value === undefined) return acc; // Skip fields that are not present in the input

        let valueLabel: string = JSON.stringify(value);

        switch (field.blockType) {
          case 'radio':
          case 'select':
          case 'multi-select': {
            if (Array.isArray(value) && value.length > 0 && typeof value[0]! === 'string') {
              const valueLabels = value.map((val: string) => {
                const option = field.options.find((option) => option.value === val);
                return option ? option.label : val; // Fallback to value if label not found
              });
              valueLabel = JSON.stringify(valueLabels.join(', '));
            } else if (typeof value === 'string') {
              const option = field.options.find((option) => option.value === value);
              valueLabel = JSON.stringify(option ? option.label : value);
            }
            break;
          }
          case 'checkbox':
            valueLabel = JSON.stringify(value === true ? 'Checked' : 'Unchecked');
            break;
          case 'date':
            valueLabel = JSON.stringify(typeof value === 'string' ? formatDate(value) : value);
            break;
          default:
            break;
        }

        acc.push({
          field: field.name,
          fieldLabel: field.label,
          value: JSON.stringify(value),
          valueLabel: valueLabel,
        });

        return acc;
      },
      [] as NonNullable<DonorScreeningSubmission['submissionData']>
    );
  }
}
