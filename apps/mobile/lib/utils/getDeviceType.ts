import { DeviceType, getDeviceTypeAsync } from 'expo-device';

export async function isDeviceTablet() {
  const deviceType = await getDeviceTypeAsync();
  return deviceType === DeviceType.TABLET;
}

export async function isDeviceTV() {
  const deviceType = await getDeviceTypeAsync();
  return deviceType === DeviceType.TV;
}
