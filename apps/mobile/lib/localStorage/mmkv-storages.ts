import { MMKV } from 'react-native-mmkv';

export const authStorage = new MMKV({
  id: 'auth-storage',
  encryptionKey: 'lactalink-auth',
});

export const setupProfileStorage = new MMKV({
  id: 'setup-profile-storage',
});

export const donationStorage = new MMKV({ id: 'donation-storage' });
export const requestStorage = new MMKV({ id: 'request-storage' });
export const deliveryStorage = new MMKV({ id: 'delivery-storage' });

export const formDataStorage = new MMKV({ id: 'form-data-storage' });

export default new MMKV({ id: 'default-storage' });
