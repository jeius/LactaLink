/**
 * Global test setup — runs inside the Vitest worker process before any test
 * module is evaluated.
 *
 * The dotenv call here is a defensive belt-and-suspenders measure on top of
 * the same call in `vitest.config.ts` (which runs in the main process before
 * workers are forked). Together they guarantee that `process.env.*` variables
 * are available regardless of which Node.js platform / fork behaviour is used.
 */
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(process.cwd(), '.env.test'), override: true });
