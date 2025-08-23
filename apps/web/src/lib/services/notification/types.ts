import { Collection, Notification } from '@lactalink/types';
import { Operation } from 'payload';

export interface VariableValidationOptions {
  allowExtraVariables?: boolean;
  allowEmptyValues?: boolean;
  strictMode?: boolean;
}

export interface CreateNotificationParams {
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
  recipient: Extract<Notification['recipient'], string | number>;
  /**
   * Additional variables to be used in the notification template
   */
  extraVariables?: Record<string, unknown>;
  /**
   * Override the default title and message
   */
  override?: CreateNotificationOverride;
}

export type CreateNotificationOverride = {
  title: string;
  message: string;
  priority?: Notification['priority'];
};

export interface TemplateProcessorOptions {
  escapeHtml?: boolean;
  allowMissingVariables?: boolean;
  customDelimiters?: { open: string; close: string };
}
