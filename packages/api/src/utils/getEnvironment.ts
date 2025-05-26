// Simple environment detection using explicit env vars
export function getAppEnvironment() {
  if (process.env.EXPO_APP === 'true') return 'expo';
  if (process.env.NEXT_APP === 'true') return 'nextjs';
  return 'unknown';
}

export function isServerEnvironment() {
  try {
    // For Next.js, check if we're on server side
    if (process.env.NEXT_APP === 'true') {
      return typeof window === 'undefined';
    }
    // Expo is always client-side
    return false;
  } catch (error) {
    // If window check fails, assume server environment
    return true;
  }
}

// More comprehensive check
export function getExecutionEnvironment() {
  // Check if running in browser
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  // Check if running in Node.js
  const isNode = typeof process !== 'undefined' && process.versions?.node;

  return {
    isBrowser,
    isNode,
    isServer: !isBrowser && isNode,
    isClient: isBrowser,
  };
}
