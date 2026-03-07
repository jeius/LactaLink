/**
 * Payload CMS configuration used exclusively by the Vitest integration test
 * suite.  It is intentionally a close mirror of the production
 * `src/payload.config.ts` with the following differences:
 *
 * - **No email adapter** — Payload falls back to console-logging emails, so
 *   tests never hit the Resend API.
 * - **No S3 / storage plugins** — tests do not upload files; omitting the S3
 *   plugin prevents outbound requests to Supabase Storage on startup.
 * - **`typescript.autoGenerate: false`** — prevents re-writing
 *   `packages/types/src/payload-types/generated.ts` every time tests run.
 * - **No admin components or import map** — the Payload admin panel is not
 *   rendered in tests; omitting the component references avoids requiring a
 *   full Next.js compile step.
 *
 * Everything else — collections, hooks, access control, the Postgres adapter,
 * the `beforeSchemaInit` schema extensions — is identical to production so
 * that the tests exercise exactly the same code paths.
 */

import Blocks from '@/blocks';
import Collections, { Users } from '@/collections';
import { Endpoints } from '@/endpoints';
import GlobalConfigs from '@/globals';
import { jobs } from '@/jobs';
import { views } from '@/lib/db/drizzle/schema';
import { logger } from '@/lib/logger';
import { plugins } from '@/lib/plugins';
import { getServerSideURL } from '@/lib/utils/getURL';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { resendAdapter } from '@payloadcms/email-resend';
import { buildConfig } from 'payload';
import sharp from 'sharp';

export default buildConfig({
  admin: {
    /**
     * Specify the auth collection so Payload knows which slug is the "users"
     * collection — required even though we never open the admin panel in tests.
     */
    user: Users.slug,
  },

  /**
   * The full collection set must match production so that all relationship
   * fields, hooks, and validators resolve correctly during tests.
   */
  collections: Collections,

  /**
   * The Payload secret only needs to be a non-empty string in tests; no real
   * auth tokens are issued.
   */
  secret: process.env.PAYLOAD_SECRET || 'test-secret-at-least-32-chars!!',

  /**
   * Disable automatic TypeScript type regeneration — types are already
   * generated and checked in CI; re-running generation during every test run
   * would slow things down and potentially overwrite the committed file.
   */
  typescript: {
    autoGenerate: false,
    declare: false,
  },

  serverURL: getServerSideURL(),
  blocks: Blocks,
  endpoints: Endpoints,
  globals: GlobalConfigs,
  jobs: jobs,
  sharp: sharp,
  plugins: plugins,
  maxDepth: 5,
  defaultDepth: 3,
  i18n: { translations: { en: { general: { payloadSettings: 'Settings' } } } },

  logger: logger,

  email: resendAdapter({
    defaultFromAddress: 'no-reply@lactalink.com',
    defaultFromName: 'LactaLink',
    apiKey: process.env.RESEND_API_KEY || '',
  }),

  db: postgresAdapter({
    idType: 'uuid',
    allowIDOnCreate: true,

    /**
     * DATABASE_URI is loaded from `.env.test` which must point to a dedicated
     * test database (separate from development / production).
     */
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },

    /**
     * Mirror the production `beforeSchemaInit` exactly so Payload's schema
     * introspection sees the same `auth_id` column on `users` and the same
     * Drizzle views injected into the schema — required for the test database
     * to pass Payload's start-up schema validation.
     */
    beforeSchemaInit: [
      ({ schema, adapter }) => {
        if (!adapter.rawTables.users) {
          console.warn('[test-config] Users table not found in raw tables');
          return schema;
        }

        adapter.rawTables.users.columns.authId = {
          name: 'auth_id',
          type: 'uuid',
          notNull: false,
        };

        return {
          ...schema,
          tables: {
            ...schema.tables,
            ...views,
          },
        };
      },
    ],
  }),
});
