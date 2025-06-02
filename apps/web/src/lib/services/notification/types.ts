import { Collection, Notification } from '@lactalink/types';
import { Operation } from 'payload';

export interface VariableValidationOptions {
  allowExtraVariables?: boolean;
  allowEmptyValues?: boolean;
  strictMode?: boolean;
}

export interface CreateNotificationParams {
  recipient: Extract<Notification['recipient'], string | number>;
  operation: Operation;
  doc: Collection;
  previousDoc?: Collection | null;
  additionalVariables?: Record<string, unknown>;
}

export interface TemplateProcessorOptions {
  escapeHtml?: boolean;
  allowMissingVariables?: boolean;
  customDelimiters?: { open: string; close: string };
}
