import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types';

export const beforeSyncWithSearch: BeforeSync = async ({ originalDoc, searchDoc }) => {
  const { displayName } = originalDoc;

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    title: displayName,
  };

  return modifiedDoc;
};
