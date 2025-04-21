import configPromise from '@payload-config';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function jwtSign({
  fieldsToSign,
  secret,
  tokenExpiration,
}: {
  fieldsToSign: Record<string, unknown>;
  secret: string;
  tokenExpiration: number;
}) {
  const secretKey = new TextEncoder().encode(secret);
  const issuedAt = Math.floor(Date.now() / 1000);
  const exp = issuedAt + tokenExpiration;
  const token = await new SignJWT(fieldsToSign)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(issuedAt)
    .setExpirationTime(exp)
    .sign(secretKey);
  return { exp, token };
}

export async function getJwtCookie() {
  const cookieStore = await cookies();
  const { cookiePrefix } = await configPromise;

  const token = cookieStore.get(`${cookiePrefix}-token`)?.value;

  if (!token) {
    throw new Error('Missing JWT from cookie.');
  }

  return token;
}
