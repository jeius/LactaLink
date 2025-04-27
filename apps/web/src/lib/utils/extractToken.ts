export function extractToken(headers: Headers) {
  let token = headers.get('Authorization') || headers.get('authorization') || undefined;

  if (token?.startsWith('JWT')) {
    token = token.replace('JWT', '').trim();
  } else if (token?.startsWith('Bearer')) {
    token = token.replace('Bearer', '').trim();
  } else {
    return undefined;
  }

  return token;
}
