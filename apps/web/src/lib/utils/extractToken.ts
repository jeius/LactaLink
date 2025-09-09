export function extractToken(
  headers: Headers,
  prefix?: 'JWT' | 'Bearer' | string
): string | undefined {
  let token = headers.get('Authorization') || headers.get('authorization') || undefined;

  if (prefix && token?.startsWith(prefix)) {
    token = token.replace(prefix, '').trim();
  } else if (token?.startsWith('JWT')) {
    token = token.replace('JWT', '').trim();
  } else if (token?.startsWith('Bearer')) {
    token = token.replace('Bearer', '').trim();
  } else {
    return undefined;
  }

  return token;
}
