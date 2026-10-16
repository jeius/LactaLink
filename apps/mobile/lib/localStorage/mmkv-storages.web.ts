import { createMMKV } from 'react-native-mmkv';

// OAuth returns through a full-page browser redirect, so the auth session must
// survive reloads. Native builds continue to use encrypted MMKV storage.
export const authStorage = {
  getString: (key: string) => window.localStorage.getItem(key) ?? undefined,
  set: (key: string, value: string) => window.localStorage.setItem(key, value),
  remove: (key: string) => window.localStorage.removeItem(key),
};

export const formDataStorage = createMMKV({ id: 'form-data-storage' });
export default createMMKV({ id: 'default-storage' });
