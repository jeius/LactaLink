export function nullTransform(val: string) {
  if (typeof val === 'string' && val.trim() === '') {
    return null;
  }
  return val;
}
export function nullTransformArray(val: string[]) {
  if (Array.isArray(val) && val.every((item) => typeof item === 'string' && item.trim() === '')) {
    return null;
  }
  return val;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function nullTransformObject(val: Record<string, any>) {
  if (typeof val === 'object' && val !== null) {
    const transformed = Object.fromEntries(
      Object.entries(val).map(([key, value]) => [key, nullTransform(value)])
    );
    return transformed;
  }
  return val;
}
export function emptyTransform(val: string) {
  if (typeof val === 'string' && val.trim() === '') {
    return undefined;
  }
  return val;
}
