/* eslint-disable @typescript-eslint/no-unused-vars */
import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types';

export const beforeSyncWithSearch: BeforeSync = async ({ originalDoc, searchDoc, payload }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc;

  const { slug, id, specializations, title, meta, excerpt } = originalDoc;

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    categories: [],
  };

  if (specializations && Array.isArray(specializations) && specializations.length > 0) {
    // get full categories and keep a flattened copy of their most important properties
    try {
      const mappedCategories = specializations.map((category) => {
        const { id, title } = category;

        return {
          relationTo: 'specializations',
          id,
          title,
        };
      });

      modifiedDoc.categories = mappedCategories;
    } catch (err) {
      console.error(
        `Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search.`
      );
    }
  }

  return modifiedDoc;
};
