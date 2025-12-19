import { NOTIFICATION_CATEGORY_KEYS } from '@lactalink/enums';
import { Collection } from '@lactalink/types/collections';
import { Notification, User } from '@lactalink/types/payload-generated-types';
import { Operation } from 'payload';

export interface VariableValidationOptions {
  allowExtraVariables?: boolean;
  allowEmptyValues?: boolean;
  strictMode?: boolean;
}

export interface AutoCreateNotificationParams {
  /**
   * The document triggering the notification
   */
  doc: Collection;
  /**
   * The previous state of the document, undefined for create operations
   */
  previousDoc?: Collection | null;
  /**
   * The operation type that triggered the notification
   */
  operation: Operation;
  /**
   * The recipient of the notification, must be a User ID
   */
  recipient: User['id'];
  /**
   * Additional variables to be used in the notification template
   */
  extraVariables?: Record<string, unknown>;
  /**
   * Override the default title and message
   */
  override?: AutoCreateNotificationOverrides;
}

export type AutoCreateNotificationOverrides = {
  title: string;
  message: string;
  priority?: Notification['priority'];
};

export interface CreateNotificationParams extends Pick<
  Notification,
  'title' | 'message' | 'recipient' | 'priority'
> {
  /**
   * Schedule delivery date for the notification
   */
  scheduleDelivery?: Date;
  categoryKey: keyof typeof NOTIFICATION_CATEGORY_KEYS;
  relatedDoc: NonNullable<NonNullable<Notification['relatedData']>['data']>;
}

export interface TemplateProcessorOptions {
  escapeHtml?: boolean;
  allowMissingVariables?: boolean;
  customDelimiters?: { open: string; close: string };
}
