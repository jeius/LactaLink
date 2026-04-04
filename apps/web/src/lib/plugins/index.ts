import { Plugin } from 'payload';
import { formBuilderPlugins } from './forms';
import { s3StoragePlugin } from './s3Storage';
import searchPlugin from './search';

export const plugins: Plugin[] = [
  // nestedDocsPlugin({
  //   collections: [],
  // }),
  searchPlugin,
  ...s3StoragePlugin,
  ...formBuilderPlugins,
];
