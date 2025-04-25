export function extractBearerToken(headers: Headers) {
  let token = headers.get('Authorization') || headers.get('authorization') || undefined;

  if (token?.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '').trim();
  }
  return token;
}
