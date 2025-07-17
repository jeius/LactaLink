import { Collection, Config, Notification, NotificationType } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import _ from 'lodash';
import { Field, Payload, SanitizedCollectionConfig } from 'payload';

export class FieldResolver {
  constructor(
    private payload: Payload,
    private collection: SanitizedCollectionConfig,
    private originalDoc: Collection
  ) {}

  public async resolveField(
    field: Field,
    parentDoc: Partial<Collection>,
    parentPath: string = '',
    fullDoc: Omit<Collection, 'createdAt' | 'updatedAt' | 'id'> = {}
  ) {
    const fieldPath =
      'name' in field && field.name
        ? parentPath
          ? `${parentPath}.${field.name}`
          : field.name
        : parentPath;

    try {
      switch (field.type) {
        case 'relationship':
          if (Array.isArray(field.relationTo)) {
            // Handle polymorphic relations

            if (field.hasMany) {
              // Handle many-to-many relationships
              const relatedDocs = await Promise.all(
                field.relationTo.map(async (relation) => {
                  const docs = await this.payload.find({
                    collection: relation,
                    where: {
                      id: { in: extractID(_.get(parentDoc, fieldPath, [])) },
                    },
                    depth: field.maxDepth || 2,
                    populate: this.populateOptions,
                  });

                  return { value: docs.docs, relationTo: relation };
                })
              );

              // Set the resolved documents in the fullDoc
              _.set(fullDoc, fieldPath, relatedDocs);
            } else {
              const relatedDocs = await Promise.all(
                field.relationTo.map(async (relation) => {
                  const doc = await this.payload.findByID({
                    collection: relation,
                    id: extractID(_.get(parentDoc, fieldPath)),
                    depth: field.maxDepth || 2,
                    populate: this.populateOptions,
                  });

                  return { value: doc, relationTo: relation };
                })
              );

              // Set the resolved documents in the fullDoc
              _.set(fullDoc, fieldPath, relatedDocs);
            }
          } else {
            if (field.hasMany) {
              // Handle many-to-many relationships
              const relatedDocs = await this.payload.find({
                collection: field.relationTo,
                where: {
                  id: { in: extractID(_.get(parentDoc, fieldPath, [])) },
                },
                depth: field.maxDepth || 2,
                populate: this.populateOptions,
              });

              // Set the resolved documents in the fullDoc
              _.set(fullDoc, fieldPath, relatedDocs.docs);
            } else if (_.get(parentDoc, fieldPath)) {
              // Handle one-to-one relationships
              const relatedDoc = await this.payload.findByID({
                collection: field.relationTo,
                id: extractID(_.get(parentDoc, fieldPath)),
                depth: field.maxDepth || 2,
                populate: this.populateOptions,
              });

              // Set the resolved document in the fullDoc
              _.set(fullDoc, fieldPath, relatedDoc);
            }
          }
          break;

        case 'join': {
          const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name;

          if (Array.isArray(field.collection)) {
            let count = 0;

            const joinDocs = await Promise.all(
              field.collection.map(async (collection) => {
                const { docs, totalDocs } = await this.payload.find({
                  collection,
                  depth: 2,
                  populate: this.populateOptions,
                  where: { [field.on]: { equals: this.originalDoc.id } },
                });

                count += totalDocs;
                return { value: docs, relationTo: collection };
              })
            );

            const newJoinDoc = {
              docs: joinDocs,
              totalDocs: count,
              hasNextPage: false,
            };

            _.set(fullDoc, fieldPath, newJoinDoc);
          } else {
            const joinDoc = await this.payload.find({
              collection: field.collection,
              depth: 2,
              populate: this.populateOptions,
              where: { [field.on]: { equals: this.originalDoc.id } },
            });

            const newJoinDoc = {
              docs: joinDoc.docs,
              totalDocs: joinDoc.totalDocs,
              hasNextPage: joinDoc.hasNextPage,
            };

            _.set(fullDoc, fieldPath, newJoinDoc);
          }

          break;
        }

        case 'tabs':
          // Recursively resolve fields in tabs
          for (const tab of field.tabs) {
            for (const subField of tab.fields) {
              await this.resolveField(subField, parentDoc, fieldPath, fullDoc);
            }
          }
          break;

        case 'array': {
          // Resolve fields in an array
          const arrayItems = _.get(parentDoc, fieldPath, []);
          const resolvedArray = await Promise.all(
            arrayItems.map(async (item: Collection, index: number) => {
              const resolvedItem: Partial<Collection> = {};
              for (const subField of field.fields) {
                await this.resolveField(subField, item, `${fieldPath}[${index}]`, resolvedItem);
              }
              return resolvedItem;
            })
          );

          // Set the resolved array in the fullDoc
          _.set(fullDoc, fieldPath, resolvedArray);
          break;
        }

        case 'group':
        case 'row':
          // Resolve fields in a group or row
          for (const subField of field.fields) {
            await this.resolveField(subField, parentDoc, fieldPath, fullDoc);
          }
          break;

        default:
          // Copy non-relationship fields directly
          _.set(fullDoc, fieldPath, _.get(parentDoc, fieldPath));
          break;
      }
    } catch (error) {
      this.payload.logger.error(
        error,
        `Error resolving field ${fieldPath} in collection ${this.collection.slug}`
      );
    }
  }

  public resolveRelatedData(
    notificationType: NotificationType,
    doc: Collection
  ): NonNullable<Notification['relatedData']> {
    const template = notificationType.template;
    const collectionSlug = this.collection.slug as 'deliveries' | 'donations' | 'requests';

    if (template.actionUrl && template.actionLabel) {
      return {
        data: { relationTo: collectionSlug, value: doc.id },
        actionUrl: template.actionUrl.replace('{{id}}', doc.id),
        actionLabel: template.actionLabel,
      };
    }
    return {
      data: { relationTo: collectionSlug, value: doc.id },
      actionUrl: `/${collectionSlug}/${doc.id}`,
      actionLabel: `View ${this.collection.labels.singular}`,
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

  private populateOptions: Partial<Config['collectionsSelect']> = {
    users: { email: true, profile: true, profileType: true, phone: true },
    individuals: { displayName: true, owner: true, addresses: true },
    hospitals: { name: true, addresses: true, owner: true },
    milkBanks: { name: true, addresses: true, owner: true },
    addresses: { displayName: true, owner: true, isDefault: true, name: true },
    regions: { name: true, code: true },
    provinces: { name: true, code: true },
    citiesMunicipalities: { name: true, code: true },
    barangays: { name: true, code: true },
    islandGroups: { name: true, code: true },
    avatars: { url: true, alt: true, width: true, height: true },
    images: { url: true, alt: true, width: true, height: true },
  };
}
