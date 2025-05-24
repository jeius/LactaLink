export function mergeHeaders(...headersList: Headers[]): Headers {
  const result = new Headers();
  for (const h of headersList) {
    h.forEach((value, key) => result.set(key, value));
  }
  return result;
}
