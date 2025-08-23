import { Collection, NotificationTypeTrigger } from '@lactalink/types';
import _ from 'lodash';
import { FlattenedField, Operator, PayloadRequest, Where, WhereField } from 'payload';
import { validOperatorSet } from 'payload/shared';

type ExtendedWhereField = WhereField & { changed?: unknown };
type ExtendedWhere = Pick<Where, 'and' | 'or'> & {
  [key: string]: ExtendedWhere | ExtendedWhereField;
};
type ExtendedOperator = Operator | 'changed';
const operatorSet = new Set<ExtendedOperator>([...validOperatorSet, 'changed']);

export class TriggerValidator {
  constructor(
    private trigger: NotificationTypeTrigger,
    private doc: Collection,
    private previousDoc?: Collection | null
  ) {
    this.isFieldChanged.bind(this);
    this.isFieldExists.bind(this);
    this.validateConditions.bind(this);
    this.validateOperator.bind(this);
  }

  public validate(fields: FlattenedField[], req?: PayloadRequest): boolean {
    const conditions = this.trigger.conditions;

    if (conditions === undefined) {
      // If no conditions are defined, the trigger is always valid
      return true;
    }

    if (conditions === null) {
      // If conditions are explicitly null, the trigger is never valid
      return false;
    }

    if (Array.isArray(conditions)) {
      // If conditions is an array, we cannot evaluate them
      req?.payload?.logger?.error('Invalid conditions format. Conditions should not be an array.');
      return false;
    }

    if (typeof conditions === 'boolean') {
      // If conditions are not an object, we cannot evaluate them
      return conditions;
    }

    if (typeof conditions !== 'object') {
      // If conditions are not an object, we cannot evaluate them
      throw new Error('Invalid conditions format. Expected an object or boolean.');
    }

    const conditionKeys = Object.keys(conditions);

    if (conditionKeys.length !== 1) {
      // If conditions do not have exactly one key, we cannot evaluate them
      req?.payload?.logger?.error('Invalid conditions format. Expected exactly one key.');
      return false;
    }

    const fieldNames = fields.map((field) => field.name).filter(Boolean);

    const validKeys = [...fieldNames, 'and', 'or'];

    if (conditionKeys.some((key) => !validKeys.includes(key))) {
      // If conditions contain keys not in the valid set, we cannot evaluate them
      req?.payload?.logger?.error(
        `Invalid conditions format. Expected keys: ${validKeys.join(', ')}. Found: ${conditionKeys.join(', ')}`
      );
      return false;
    }

    const isValid = this.validateConditions(conditions);

    if (!isValid) {
      req?.payload?.logger?.error(
        'Invalid conditions format. Please check the structure of your conditions.'
      );
      return false;
    }

    // Recursively evaluate the conditions
    const evaluate = (cond: ExtendedWhere): boolean => {
      const keys = Object.keys(cond);

      if (keys.length !== 1) {
        req?.payload?.logger?.error(
          `Invalid condition format. Expected exactly one key in condition object. Either "and", "or", or a field name. Found: ${keys.join(', ')}`
        );
        return false;
      }

      return keys.every((key) => {
        if (Array.isArray(cond[key])) {
          if (key === 'and') {
            return cond[key].every(evaluate);
          } else if (key === 'or') {
            return cond[key].some(evaluate);
          } else {
            req?.payload?.logger?.error(
              `Invalid condition for key "${key}". Expected a single condition, found ${cond[key].length}.`
            );
            return false;
          }
        }

        const operator = Object.keys(cond[key]!)[0];
        const isValidOperator = this.validateOperator(operator);

        // Check if the key is a valid Operator.
        if (!isValidOperator) {
          return false;
        }

        const value = cond[key]![operator];
        const fieldValue = _.get(this.doc, key);

        switch (operator) {
          case 'equals':
            return _.isEqual(fieldValue, value);

          case 'not_equals':
            return !_.isEqual(fieldValue, value);

          case 'in':
            return Array.isArray(value) && value.includes(fieldValue);

          case 'not_in':
            return !Array.isArray(value) || !value.includes(fieldValue);

          case 'exists':
            return this.isFieldExists([key, value], req);

          case 'greater_than':
            return _.isNumber(fieldValue) && _.isNumber(value) && fieldValue > value;

          case 'greater_than_equal':
            return _.isNumber(fieldValue) && _.isNumber(value) && fieldValue >= value;

          case 'less_than':
            return _.isNumber(fieldValue) && _.isNumber(value) && fieldValue < value;

          case 'less_than_equal':
            return _.isNumber(fieldValue) && _.isNumber(value) && fieldValue <= value;

          case 'contains':
            return _.isString(fieldValue) && _.isString(value) && fieldValue.includes(value);

          case 'intersects':
            return (
              Array.isArray(fieldValue) &&
              Array.isArray(value) &&
              _.intersection(fieldValue, value).length > 0
            );

          case 'changed':
            return this.isFieldChanged([key, value], req);

          default:
            return false;
        }
      });
    };

    return evaluate(conditions);
  }

  private validateOperator(operator?: string | null): operator is ExtendedOperator {
    return !!operator && operatorSet.has(operator as ExtendedOperator);
  }

  private validateConditions(conditions: { [key: string]: unknown }): conditions is ExtendedWhere {
    // Recursively validate operators in the conditions
    const validate = (cond: { [key: string]: unknown }): boolean => {
      const keys = Object.keys(cond);

      for (const key of keys) {
        if (key === 'and' || key === 'or') {
          if (!Array.isArray(cond[key])) {
            return false;
          }
          for (const subCond of cond[key] as { [key: string]: unknown }[]) {
            if (!validate(subCond)) {
              return false;
            }
          }
        } else {
          const operator = Object.keys(cond[key] as { [key: string]: unknown })[0];
          if (!this.validateOperator(operator)) {
            return false;
          }
        }
      }

      return true;
    };

    return validate(conditions);
  }

  private isFieldChanged([key, value]: [string, unknown], req?: PayloadRequest): boolean {
    // Check for field change
    if (_.isBoolean(value)) {
      if (value) {
        if (!this.previousDoc) {
          // If no previous doc, treat as changed if current value exists
          return Boolean(_.get(this.doc, key));
        }
        // Use Lodash to check if the field has changed
        return !_.isEqual(_.get(this.doc, key), _.get(this.previousDoc, key));
      } else {
        // If not changed, ensure the field is the same in both docs
        if (!this.previousDoc) {
          // If no previous doc, treat as not changed only if current value is null/undefined
          return _.get(this.doc, key) === undefined || _.get(this.doc, key) === null;
        }
        return _.isEqual(_.get(this.doc, key), _.get(this.previousDoc, key));
      }
    }

    req?.payload?.logger?.error(
      `Invalid 'changed' condition for key "${key}". Expected an object with a boolean 'changed' property.`
    );

    return false;
  }

  private isFieldExists([key, value]: [string, unknown], req?: PayloadRequest): boolean {
    // Check for field existence
    if (_.isBoolean(value)) {
      const fieldValue = _.get(this.doc, key);
      return value
        ? fieldValue !== undefined && fieldValue !== null
        : fieldValue === undefined || fieldValue === null;
    }

    req?.payload?.logger?.error(
      `Invalid 'exists' condition for key "${key}". Expected a boolean value.`
    );

    return false;
  }
}
