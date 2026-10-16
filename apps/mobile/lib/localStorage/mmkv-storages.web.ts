import { createMMKV } from 'react-native-mmkv';

// Keep browser preview sessions in memory; native encrypted storage is unchanged.
const session = new Map<string, string>();
export const authStorage = {
  getString: (key: string) => session.get(key),
  set: (key: string, value: string) => { session.set(key, value); },
  remove: (key: string) => session.delete(key),
};

export const formDataStorage = createMMKV({ id: 'form-data-storage' });
export default createMMKV({ id: 'default-storage' });
