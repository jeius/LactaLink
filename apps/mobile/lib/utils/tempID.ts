import { randomUUID } from 'expo-crypto';
import { TEMP_ID_PREFIX } from '../constants';

export function createTempID(): string {
  return `${TEMP_ID_PREFIX}-${randomUUID()}`;
}

export function isTempID(id: string): boolean {
  return id.startsWith(TEMP_ID_PREFIX);
}
