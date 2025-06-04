import { Collection, NotificationTypeTrigger } from '@lactalink/types';
import _ from 'lodash';

export class TriggerValidator {
  private doc: Collection;
  private previousDoc?: Collection | null;
  private trigger: NotificationTypeTrigger;

  constructor(trigger: NotificationTypeTrigger, doc: Collection, previousDoc?: Collection | null) {
    this.trigger = trigger;
    this.doc = doc;
    this.previousDoc = previousDoc;
  }

  public validate(): boolean {
    const { conditions } = this.trigger;

    if (!conditions) {
      // If no conditions are defined, the trigger is always valid
      return true;
    }

    if (typeof conditions === 'boolean') {
      // If conditions are not an object, we cannot evaluate them
      return conditions;
    }

    if (typeof conditions !== 'object') {
      // If conditions are not an object, we cannot evaluate them
      throw new Error('Invalid conditions format. Expected an object or boolean.');
    }

    return Object.entries(conditions).every(([key, value]) => {
      // Check for field existence
      if (
        typeof value === 'object' &&
        value !== null &&
        'exists' in value &&
        typeof (value as { exists: unknown }).exists !== 'undefined'
      ) {
        const exists = (value as { exists: boolean }).exists;
        const fieldValue = _.get(this.doc, key);
        return exists
          ? fieldValue !== undefined && fieldValue !== null
          : fieldValue === undefined || fieldValue === null;
      }

      // Check for field change
      if (
        typeof value === 'object' &&
        value !== null &&
        'changed' in value &&
        (value as { changed: unknown }).changed === true
      ) {
        if (!this.previousDoc) {
          // If no previous doc, treat as changed if current value exists
          return Boolean(_.get(this.doc, key));
        }

        // Use Lodash to check if the field has changed
        return !_.isEqual(_.get(this.doc, key), _.get(this.previousDoc, key));
      }

      // Check for value match
      return _.isEqual(_.get(this.doc, key), value);
    });
  }
}
