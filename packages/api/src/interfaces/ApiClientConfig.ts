import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuration interface for initializing the API client across different environments.
 *
 * This interface defines the required configuration options for setting up the API client
 * in both Next.js and Expo applications, ensuring proper authentication and environment-specific
 * behavior.
 *
 * @example
 * ```typescript
 * // Next.js client-side configuration
 * const config: ApiClientConfig = {
 *   apiUrl: 'https://api.example.com',
 *   supabase: createBrowserClient(supabaseUrl, supabaseKey),
 *   environment: 'nextjs',
 *   bypassToken: process.env.NEXT_PUBLIC_BYPASS_TOKEN
 * };
 *
 * // Expo configuration
 * const config: ApiClientConfig = {
 *   apiUrl: process.env.EXPO_PUBLIC_API_URL,
 *   supabase: createClient(supabaseUrl, supabaseKey),
 *   environment: 'expo'
 * };
 * ```
 */
export interface ApiClientConfig {
  /**
   * The base URL for the API server.
   *
   * This should be a complete URL including the protocol (http/https) and domain.
   * It will be used as the base for all API requests made by the client.
   *
   * @example
   * ```typescript
   * // Production API
   * apiUrl: 'https://api.lactalink.com'
   *
   * // Development API
   * apiUrl: 'http://localhost:3000'
   *
   * // Using URL object
   * apiUrl: new URL('https://api.example.com')
   * ```
   */
  apiUrl: string | URL;

  /**
   * Configured Supabase client instance or a callback to create one.
   *
   * This can be either a statically configured Supabase client or a function that
   * returns a new Supabase client instance. Use the callback approach if you need
   * a fresh client per request, for example in a serverless function or API route.
   *
   * - For Next.js client-side: Use `createBrowserClient()`
   * - For Next.js server-side: Use `createServerClient()` with cookies
   * - For Expo: Use `createClient()`
   *
   * The client handles authentication, real-time subscriptions, and database operations.
   *
   * @example
   * ```typescript
   * // Next.js browser client
   * supabase: () => createBrowserClient(
   *   process.env.NEXT_PUBLIC_SUPABASE_URL,
   *   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   * )
   *
   * // Next.js server client
   * supabase: () => createServerClient(
   *   process.env.NEXT_PUBLIC_SUPABASE_URL,
   *   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
   *   { cookies }
   * )
   *
   * // Expo client
   * supabase: createClient(
   *   process.env.EXPO_PUBLIC_SUPABASE_URL,
   *   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
   * )
   * ```
   */
  supabase: SupabaseClient | (() => SupabaseClient);

  /**
   * The application environment where the API client is running.
   *
   * This determines environment-specific behavior such as:
   * - Server-side rendering capabilities (nextjs can run on server, expo cannot)
   * - Authentication flow handling
   * - Error handling and debugging
   * - Platform-specific optimizations
   *
   * @example
   * ```typescript
   * // For Next.js applications (supports SSR/SSG)
   * environment: 'nextjs'
   *
   * // For React Native/Expo applications (client-only)
   * environment: 'expo'
   * ```
   */
  environment: 'nextjs' | 'expo';

  /**
   * Optional bypass token for development and testing.
   *
   * This token can be used to bypass certain authentication or rate limiting
   * mechanisms during development. It should typically be used for:
   * - Development environment requests
   * - Testing and debugging
   * - Administrative operations
   * - CI/CD pipeline operations
   *
   * ⚠️ **Security Warning**: This token should never be exposed in production
   * client-side code. Use appropriate environment variable prefixes:
   * - Next.js: Use `NEXT_PUBLIC_` only if needed client-side
   * - Expo: Use `EXPO_PUBLIC_` only if needed client-side
   * - Server-only: No prefix (keeps it server-only)
   *
   * @example
   * ```typescript
   * // Development bypass token
   * bypassToken: process.env.DEV_BYPASS_TOKEN
   *
   * // Vercel deployment bypass
   * bypassToken: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
   *
   * // Production (omit for security)
   * bypassToken: undefined
   * ```
   */
  bypassToken?: string;
}
