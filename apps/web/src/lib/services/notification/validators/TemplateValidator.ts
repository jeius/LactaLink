import { NotificationType } from '@lactalink/types';
import { VariableValidationOptions } from '../types';

/**
 * TemplateValidator is a utility class for validating notification templates.
 *
 * It checks for missing, unexpected, and empty variables, and can enforce strict type checking.
 *
 * @example
 * const validator = new TemplateValidator();
 * validator.validate(notificationType, providedVariables, {
 *   allowExtraVariables: false,
 *   allowEmptyValues: true,
 *   strictMode: true,
 * });
 */
export class TemplateValidator {
  /**
   * Validates the provided variables against the notification type's template.
   *
   * @param notificationType The notification type containing the template and its variables.
   * @param providedVariables The variables provided for validation.
   * @param options Options for validation behavior.
   * @throws Error if validation fails.
   */
  validate(
    notificationType: NotificationType,
    providedVariables: Record<string, unknown> = {},
    options: VariableValidationOptions = {}
  ): void {
    const { allowExtraVariables = true, allowEmptyValues = true, strictMode = true } = options;

    const templateVariables = notificationType.template?.variables || [];
    const expectedKeys = new Set(templateVariables.map((v) => v.key));
    const providedKeys = new Set(Object.keys(providedVariables));

    const errors: string[] = [];
    const warnings: string[] = [];

    this.validateMissingVariables(expectedKeys, providedKeys, errors);

    this.validateUnexpectedVariables(
      expectedKeys,
      providedKeys,
      allowExtraVariables,
      errors,
      warnings
    );

    this.validateEmptyValues(expectedKeys, providedVariables, allowEmptyValues, errors);

    if (strictMode) {
      this.validateTypes(templateVariables, providedVariables, errors);
    }

    this.handleValidationResults(notificationType.key, errors, warnings);
  }

  private validateMissingVariables(
    expectedKeys: Set<string>,
    providedKeys: Set<string>,
    errors: string[]
  ) {
    const missing = Array.from(expectedKeys).filter((key) => !providedKeys.has(key));
    if (missing.length > 0) {
      errors.push(`Missing required variables: ${missing.join(', ')}`);
    }
  }

  private validateUnexpectedVariables(
    expectedKeys: Set<string>,
    providedKeys: Set<string>,
    allowExtra: boolean,
    errors: string[],
    warnings: string[]
  ) {
    const unexpected = Array.from(providedKeys).filter((key) => !expectedKeys.has(key));
    if (unexpected.length > 0) {
      const message = `Unexpected variables: ${unexpected.join(', ')}`;
      allowExtra ? warnings.push(message) : errors.push(message);
    }
  }

  private validateEmptyValues(
    expectedKeys: Set<string>,
    providedVars: Record<string, unknown>,
    allowEmptyValues: boolean,
    errors: string[]
  ) {
    // Check for empty values in provided variables
    for (const key of expectedKeys) {
      const value = providedVars[key];
      if (value === undefined || (typeof value === 'string' && value.trim() === '')) {
        if (!allowEmptyValues) {
          errors.push(`Variable "${key}" cannot be empty`);
        }
      }
    }
  }

  private validateTypes(
    templateVariables: NonNullable<NotificationType['template']['variables']>,
    providedVariables: Record<string, unknown>,
    errors: string[]
  ) {
    for (const variable of templateVariables) {
      const value = providedVariables[variable.key];
      if (value === undefined && variable.required) {
        errors.push(`Variable "${variable.key}" is required but not provided`);
      } else if (value === undefined && !variable.required) {
        continue;
      } else if (value !== undefined) {
        switch (variable.type) {
          case 'date': {
            const dateValue = new Date(value as string);
            if (isNaN(dateValue.getTime())) {
              errors.push(`Variable "${variable.key}" should be a valid date`);
            }
            break;
          }

          case 'number': {
            if (typeof value !== 'number' || isNaN(value as number)) {
              errors.push(`Variable "${variable.key}" should be a valid number`);
            }
            break;
          }

          case 'array': {
            if (!Array.isArray(value)) {
              errors.push(`Variable "${variable.key}" should be an array`);
            }
            break;
          }

          default:
            if (typeof value !== variable.type) {
              errors.push(`Variable "${variable.key}" should be of type "${variable.type}"`);
            }
            break;
        }
      }
    }
  }

  private handleValidationResults(typeKey: string, errors: string[], warnings: string[]): void {
    if (errors.length > 0) {
      throw new Error(`Validation failed for notification type "${typeKey}": ${errors.join(', ')}`);
    }
    if (warnings.length > 0) {
      console.warn(
        `Validation warnings for notification type "${typeKey}": ${warnings.join(', ')}`
      );
    }
  }
}
