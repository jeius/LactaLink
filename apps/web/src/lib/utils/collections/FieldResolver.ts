import { Collection, Notification, NotificationType } from '@lactalink/types';
import _ from 'lodash';
import { SanitizedCollectionConfig } from 'payload';

export class FieldResolver {
  constructor(private collection: SanitizedCollectionConfig) {}

  public resolveRelatedData(
    notificationType: NotificationType,
    doc: Collection
  ): NonNullable<Notification['relatedData']> {
    const template = notificationType.template;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collectionSlug = this.collection.slug as any;

    const actionUrl = template?.actionUrl
      ? template.actionUrl.replace('{{id}}', doc.id)
      : `/${collectionSlug}/${doc.id}`;
    const actionLabel = template?.actionLabel
      ? template.actionLabel
      : `View ${this.collection.labels.singular}`;

    return {
      data: { relationTo: collectionSlug, value: doc.id },
      actionUrl,
      actionLabel,
    };
  }

  public resolveVariables(
    notificationType: NotificationType,
    doc: Collection
  ): Record<string, unknown> {
    const variables: Record<string, unknown> = {};
    const template = notificationType.template;

    if (!template || !template.variables) {
      return variables; // No variables to resolve
    }

    for (const { key, path, defaultValue } of template.variables) {
      if (!path) {
        // If no path is provided, skip this variable
        continue;
      }

      // Resolve the value from the document using the path
      const value = _.get(doc, path, undefined);

      // Use the resolved value or default
      variables[key] = value !== undefined ? value : defaultValue;
    }

    return variables;
  }
}
