import { Collection, NotificationTypeTrigger } from '@lactalink/types';

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

    return Object.entries(conditions).every(([k, value]) => {
      const key = k as keyof Collection;

      // If the key does not exist in the document, we cannot evaluate it
      if (
        typeof value === 'object' &&
        value !== null &&
        'exists' in value &&
        typeof (value as { exists: unknown }).exists !== 'undefined'
      ) {
        // Check for field existence
        return (value as { exists: boolean }).exists
          ? this.doc[key] !== undefined && this.doc[key] !== null
          : this.doc[key] === undefined || this.doc[key] === null;
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
          return Boolean(this.doc[key]);
        }

        // Check if the field has changed
        return this.doc[key] !== this.previousDoc[key];
      }

      // Check for value match
      return this.doc[key] === value;
    });
  }
}
