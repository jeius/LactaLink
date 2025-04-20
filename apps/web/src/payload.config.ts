import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import Collections, { Admins } from './collections';
import { Endpoints } from './endpoints';
import { plugins } from './lib/plugins';
import { getServerSideURL } from './lib/utils/getURL';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const autoLoginConfig =
  process.env.NEXT_PUBLIC_ENABLE_AUTOLOGIN === 'true'
    ? {
        username: process.env.NEXT_PUBLIC_ADMIN_USERNAME,
        email: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        password: process.env.NEXT_PUBLIC_ADMIN_PASS,
        prefillOnly: true,
      }
    : false;

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '@/components/Logo',
      },
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    avatar: 'default',
    autoLogin: autoLoginConfig,
  },
  auth: { jwtOrder: ['JWT', 'Bearer', 'cookie'] },
  collections: Collections,
  serverURL: getServerSideURL(),
  editor: lexicalEditor(),
  endpoints: Endpoints,
  i18n: { translations: { en: { general: { payloadSettings: 'Settings' } } } },
  secret: process.env.PAYLOAD_SECRET || '',
  cookiePrefix: 'user-session',
  typescript: {
    outputFile: path.resolve(dirname, './lib/types/payload-types.ts'),
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
