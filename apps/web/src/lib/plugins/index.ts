import { s3Storage } from '@payloadcms/storage-s3';
import { Plugin } from 'payload';
import StorageConfig from './storage-config';

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
  s3Storage({
    collections: {
      images: true,
    },
    bucket: process.env.S3_BUCKET_IMAGES!,
    config: StorageConfig,
  }),
  s3Storage({
    collections: {
      media: true,
    },
    bucket: process.env.S3_BUCKET_MEDIA!,
    config: StorageConfig,
  }),
  s3Storage({
    collections: {
      avatars: true,
    },
    bucket: process.env.S3_BUCKET_AVATARS!,
    config: StorageConfig,
  }),
];
