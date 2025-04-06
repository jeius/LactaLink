import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import Collections from './collections';
import { Users } from './collections/Users';
import { plugins } from './lib/plugins';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: Collections,
  editor: lexicalEditor(),
  i18n: { translations: { en: { general: { payloadSettings: 'Settings' } } } },
  secret: process.env.PAYLOAD_SECRET || '',
  cookiePrefix: 'user-session',
  typescript: {
    outputFile: path.resolve(dirname, '../../../packages/types/index.ts'),
  },
  db: postgresAdapter({
    idType: 'uuid',
    allowIDOnCreate: true,
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins,
});
