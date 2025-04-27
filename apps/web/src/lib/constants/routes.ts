export const AUTH_PAGES = {
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  VERIFY: '/auth/verify-otp',
};

export const ERROR_PAGES = {
  ERROR: '/error',
};

export const PUBLIC_ROUTES = {
  AUTH: '/auth/callback',
  API: '/api',
  ...AUTH_PAGES,
  ...ERROR_PAGES,
};

export const SEARCH_PARAMS_KEYS = {
  REDIRECT: 'redirect',
  MESSAGE: 'msg',
};
