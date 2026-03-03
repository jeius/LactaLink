import {
  date,
  DateFieldValidation,
  json,
  JSONFieldValidation,
  number,
  NumberFieldValidation,
  relationship,
  RelationshipFieldValidation,
  select,
  SelectFieldValidation,
  text,
  TextFieldValidation,
} from 'payload/shared';

/**
 * Validator for fields that allows `null` or `undefined` value during creation,
 * but applies standard validation if a value is provided.
 */
export class NullableValidator {
  /**
   * For text fields, allow null/undefined but validate non-empty values with standard text validation
   */
  static text: TextFieldValidation = (value, ctx) => {
    if (!value) return true;
    return text(value, ctx);
  };

  /**
   * For number fields, allow null/undefined but validate non-empty values with standard number validation
   */
  static number: NumberFieldValidation = (value, ctx) => {
    if (value === null || value === undefined) return true;
    return number(value, ctx);
  };

  /**
   * For date fields, allow null/undefined but validate non-empty values with standard date validation
   */
  static date: DateFieldValidation = (value, ctx) => {
    if (!value) return true;
    return date(value, ctx);
  };

  /**
   * For JSON fields, allow null/undefined but validate non-empty values with standard JSON validation
   */
  static json: JSONFieldValidation = (value, ctx) => {
    if (!value) return true;
    return json(value, ctx);
  };

  /**
   * For relationship fields, allow null/undefined but validate non-empty values with standard relationship validation
   */
  static relationship: RelationshipFieldValidation = (value, ctx) => {
    if (!value) return true;
    return relationship(value, ctx);
  };

  /**
   * For select fields, allow null/undefined but validate non-empty values with standard select validation
   */
  static select: SelectFieldValidation = (value, ctx) => {
    if (!value) return true;
    return select(value, ctx);
  };
}
