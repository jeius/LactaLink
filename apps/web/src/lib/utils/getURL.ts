import canUseDOM from './canUseDOM';

const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export const getClientSideURL = (): string | 'http://localhost:3000' => {
  let url = serverUrl;

  if (canUseDOM) {
    const protocol = window.location.protocol;
    const domain = window.location.hostname;
    const port = window.location.port;

    const origin = window.location.origin;

    url = origin || `${protocol}//${domain}${port ? `:${port}` : ''}`;
  } else if (!url && vercelProdUrl) {
    url = `https://${vercelProdUrl}`;
  } else if (!url) {
    url = 'http://localhost:3000';
  }

  return url;
};

export const getServerSideURL = (): string | 'http://localhost:3000' => {
  let url = serverUrl;

  if (!url && vercelProdUrl) {
    url = `https://${vercelProdUrl}`;
  } else if (!url) {
    url = 'http://localhost:3000';
  }

  return url;
};

export function validateUrl(url: unknown): url is string {
  try {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return false;
    }

    const parsedUrl = new URL(url);
    return parsedUrl.protocol.includes('http:') || parsedUrl.protocol.includes('https:');
  } catch (_) {
    return false;
  }
}
