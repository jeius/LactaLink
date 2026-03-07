import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Load test environment variables BEFORE any module is imported by test workers
dotenvConfig({ path: resolve(process.cwd(), '.env.test'), override: true });

export default defineConfig({
  /**
   * `vite-tsconfig-paths` resolves the `@/*` path alias from apps/web/tsconfig.json,
   * allowing test files to import from `@/collections`, `@/lib`, etc. exactly as
   * production code does.
   */
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    environment: 'node',

    /**
     * Tests live in a central `tests/` folder mirroring the `src/` path structure.
     * e.g. src/collections/transaction-system → tests/collections/transaction-system/
     */
    include: ['tests/**/*.test.ts'],

    /**
     * `forks` pool with `singleFork: true` ensures all test files run in the same
     * Node.js child process. This is critical because Payload v3 uses a module-level
     * singleton — the first call to `getPayload()` stores the instance and every
     * subsequent call returns the same one. Running tests in separate workers would
     * create multiple Payload instances, each opening their own DB connection pool,
     * causing port/connection exhaustion and flaky results.
     */
    pool: 'forks',

    /**
     * Test and hook timeouts are generous because integration tests make real
     * round-trips to PostgreSQL — schema introspection on first init can take
     * several seconds on a remote Supabase instance.
     */
    testTimeout: 60_000,
    hookTimeout: 60_000,

    /**
     * `setupFiles` run inside the worker BEFORE each test file's module graph is
     * evaluated. This ensures env vars are available when Payload config modules
     * (which read `process.env.*`) are first imported.
     */
    setupFiles: ['./tests/setup.ts'],
  },
});
