export const AUTH_PAGES = {
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  VERIFY: '/auth/verify-otp',
  CREATE_ADMIN: '/auth/create-first-admin',
};

export const ERROR_PAGES = {
  ERROR: '/error',
};

export const PUBLIC_ROUTES = {
  AUTH: '/auth/callback',
  API: '/api',
  PUBLIC: '/',
  ...AUTH_PAGES,
  ...ERROR_PAGES,
};

export const SEARCH_PARAMS_KEYS = {
  REDIRECT: 'redirect',
  MESSAGE: 'msg',
};

export const ID_VERIFICATION_URL = '/api/verify-identity';
export const SEED_NOTIFICATIONS_URL = '/api/seed/notifications';
export const SEED_PSGC_URL = '/api/seed/psgc';
export const SEED_ISLAND_GROUPS_URL = '/api/seed/island-groups';
export const SEED_REGIONS_URL = '/api/seed/regions';
export const SEED_PROVINCES_URL = '/api/seed/provinces';
export const SEED_CITIES_MUNICIPALITIES_URL = '/api/seed/cities-municipalities';
export const SEED_BARANGAYS_URL = '/api/seed/barangays';
export const SEED_STATUS_URL = '/api/seed/status';
export const DIRECTIONS_URL = '/api/directions';
