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

    if (conditions === undefined) {
      // If no conditions are defined, the trigger is always valid
      return true;
    }

    if (conditions === null) {
      // If conditions are explicitly null, the trigger is never valid
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

    if (Object.keys(conditions).length === 0) {
      // If conditions object is empty, the trigger is never valid
      return false;
    }

    return Object.entries(conditions).every(([key, value]) => {
      // Check for field existence
      if (
        typeof value === 'object' &&
        value &&
        'exists' in value &&
        typeof value.exists === 'boolean'
      ) {
        const exists = value.exists;
        const fieldValue = _.get(this.doc, key);
        return exists
          ? fieldValue !== undefined && fieldValue !== null
          : fieldValue === undefined || fieldValue === null;
      }

      // Check for field change
      if (
        typeof value === 'object' &&
        value &&
        'changed' in value &&
        typeof value.changed === 'boolean'
      ) {
        const changed = value.changed;

        if (changed) {
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

      // Check for value match
      return _.isEqual(_.get(this.doc, key), value);
    });
  }
}
