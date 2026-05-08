/**
 * Utility functions for creating and verifying CRON robot JWT tokens.
 *
 * Uses the `jose` library with the `HS256` algorithm and the `CRON_SECRET`
 * environment variable as the symmetric signing key.
 */

import { status as HttpStatus } from 'http-status';
import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { APIError } from 'payload';

/**
 * Encodes the `CRON_SECRET` environment variable as a `Uint8Array` for use as a signing key.
 *
 * @throws {Error} If `CRON_SECRET` is not set in the environment.
 * @returns The encoded secret key.
 */
function getCRONSecretKey(): Uint8Array {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Error('CRON_SECRET environment variable is not set.');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Signs a JWT token for use by a CRON robot.
 *
 * @param payload - Additional claims to include in the JWT payload.
 * @param expiresIn - Token expiry duration in `jose` format (e.g. `'5m'`, `'1h'`).
 * Defaults to `'5m'`.
 * @returns A signed JWT string.
 *
 * @throws {Error} If `CRON_SECRET` is not set.
 *
 * @example
 * const token = await signCRONJWT({ jobId: 'cleanup' });
 */
export async function signCRONJWT(
  payload: Record<string, unknown> = {},
  expiresIn: string = '5m'
): Promise<string> {
  const key = getCRONSecretKey();

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

/**
 * Verifies a CRON robot JWT token.
 *
 * @param token - The JWT string to verify.
 * @returns The decoded JWT payload if the token is valid and not expired.
 *
 * @throws {APIError} With status `401 Unauthorized` if the token is invalid,
 * expired, or the secret key is not set.
 *
 * @example
 * const claims = await verifyCRONJWT(token);
 */
export async function verifyCRONJWT(token: string): Promise<JWTPayload> {
  try {
    const key = getCRONSecretKey();
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    return payload;
  } catch {
    const status = HttpStatus.UNAUTHORIZED;
    throw new APIError(
      'Invalid or expired CRON token.',
      status,
      { message: HttpStatus[`${status}_MESSAGE`] },
      true
    );
  }
}
