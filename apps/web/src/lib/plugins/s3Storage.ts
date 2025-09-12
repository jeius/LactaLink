import { s3Storage, S3StorageOptions } from '@payloadcms/storage-s3';
import { Plugin } from 'payload';

const StorageConfig: S3StorageOptions['config'] = {
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
};

export const s3StoragePlugin: Plugin[] = [
  s3Storage({
    collections: {
      images: true,
    },
    bucket: process.env.S3_BUCKET_IMAGES,
    config: StorageConfig,
    clientUploads: true,
    acl: 'public-read',
  }),
  s3Storage({
    collections: {
      'milk-bag-images': true,
    },
    bucket: process.env.S3_BUCKET_MILK_BAG_IMAGES,
    config: StorageConfig,
    clientUploads: true,
    acl: 'private',
  }),
  s3Storage({
    collections: {
      avatars: true,
    },
    bucket: process.env.S3_BUCKET_AVATARS,
    config: StorageConfig,
    clientUploads: true,
    acl: 'public-read',
  }),
  s3Storage({
    collections: {
      'identity-images': true,
    },
    bucket: process.env.S3_BUCKET_ID_IMAGES,
    config: StorageConfig,
    clientUploads: true,
    acl: 'private',
  }),
];
