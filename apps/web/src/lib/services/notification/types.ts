/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Notification,
  NotificationChannel,
  NotificationChannelStats,
  NotificationType,
} from '@lactalink/types';

export interface VariableValidationOptions {
  allowExtraVariables?: boolean;
  allowEmptyValues?: boolean;
  strictMode?: boolean;
}

export interface CreateNotificationParams {
  recipient: Notification['recipient'];
  typeKey: NotificationType['key'];
  variables?: Record<string, unknown>;
  relatedData?: NonNullable<Notification['relatedData']>;
  overrides?: {
    priority?: Notification['priority'];
    channels?: NotificationChannel['id'][]; // Array of channel IDs
    scheduledFor?: NotificationChannelStats[number]['scheduledFor'];
    title?: Notification['title']; // Manual override for title
    message?: Notification['message']; // Manual override for message
  };
}

export interface TemplateProcessorOptions {
  escapeHtml?: boolean;
  allowMissingVariables?: boolean;
  customDelimiters?: { open: string; close: string };
}
