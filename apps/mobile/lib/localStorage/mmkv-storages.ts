import { MMKV } from 'react-native-mmkv';

export const authStorage = new MMKV({
  id: 'auth-storage',
  encryptionKey: 'lactalink-auth',
});

export const formDataStorage = new MMKV({ id: 'form-data-storage' });

export default new MMKV({ id: 'default-storage' });
