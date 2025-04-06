import { S3StorageOptions } from '@payloadcms/storage-s3';

const StorageConfig: S3StorageOptions['config'] = {
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  // ... Other S3 configuration
};

export default StorageConfig;
