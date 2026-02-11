import { createMMKV } from 'react-native-mmkv';

export const authStorage = createMMKV({
  id: 'auth-storage',
  encryptionKey: 'lactalink-auth',
});

export const formDataStorage = createMMKV({ id: 'form-data-storage' });

export default createMMKV({ id: 'default-storage' });
