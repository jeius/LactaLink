import { Plugin } from 'payload';
import { s3StoragePlugin } from './s3Storage';

export const plugins: Plugin[] = [
  // nestedDocsPlugin({
  //   collections: [],
  // }),
  // searchPlugin({
  //   collections: [],
  //   beforeSync: beforeSyncWithSearch,
  //   searchOverrides: {
  //     fields: ({ defaultFields }) => {
  //       return [...defaultFields, ...searchFields];
  //     },
  //     admin: { group: collectionGroup.system },
  //   },
  // }),
  ...s3StoragePlugin,
];
