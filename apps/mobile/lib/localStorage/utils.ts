import {
  DonationSchema,
  IdentitySchema,
  RequestSchema,
  SetupProfileSchema,
} from '@lactalink/form-schemas';
import { Collection } from '@lactalink/types/collections';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { produce } from 'immer';
import { DeepPartial } from 'react-hook-form';
import { type MMKV } from 'react-native-mmkv';
import { getMeUser } from '../stores/meUserStore';
import { InfiniteDataMap } from '../types';
import Storage, { formDataStorage } from './mmkv-storages';

type Schemas = {
  'donation-create': DonationSchema;
  'identity-create': IdentitySchema;
  'request-create': RequestSchema;
  'profile-create': SetupProfileSchema;
};

export type SchemaName = keyof Schemas;

export type Schema<TName extends SchemaName> = Schemas[TName];

const BASE_STORAGE_KEYS: Record<SchemaName, string> = {
  'donation-create': 'donation-form',
  'identity-create': 'identity-verification-form',
  'request-create': 'request-form',
  'profile-create': 'setup-profile-form',
};

export function getSavedFormData<TName extends SchemaName>(
  schemaName: TName
): DeepPartial<Schema<TName>> | null {
  const key = createKey(schemaName);
  if (!key) return null;

  const stored = formDataStorage.getString(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn(`Failed to parse stored ${schemaName} form data: `, extractErrorMessage(e));
    }
  }

  return null;
}

export function saveFormData<TName extends SchemaName>(
  schemaName: TName,
  data: DeepPartial<Schema<TName>>
): void {
  const key = createKey(schemaName);
  if (!key) return;

  try {
    const stringified = JSON.stringify(data);
    formDataStorage.set(key, stringified);
  } catch (e) {
    console.warn(`Failed to save ${schemaName} form data: `, extractErrorMessage(e));
  }
}

export function deleteSavedFormData(schemaName: SchemaName): void {
  const key = createKey(schemaName);
  if (!key) return;
  formDataStorage.delete(key);
}

export function getStoredData<T>(key: string, storage: MMKV = Storage) {
  const stored = storage.getString(key);
  try {
    if (stored) {
      return JSON.parse(stored) as T;
    }
    return undefined;
  } catch (err) {
    console.warn('Failed to parse stored data', err);
    throw err;
  }
}

export function storeData<T>(key: string, data: T, storage: MMKV = Storage) {
  storage.set(key, JSON.stringify(data));
}

export function getStoredInfiniteDocuments<T extends Collection>(key: string) {
  const stored = getStoredData<InfiniteDataMap<T, number>>(key);
  if (!stored) return undefined;
  return produce(stored, (draft) => {
    draft.pages.forEach((page) => {
      // Convert Array of entries back into Map
      page.docs = new Map(page.docs);
    });
  });
}

export function storeInfiniteDocuments<T extends Collection>(
  data: InfiniteDataMap<T>,
  key: string
) {
  storeData(key, {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      // Convert Map into Array of entries for storage serialization
      docs: Array.from(page.docs.entries()),
    })),
  });
}

// #region Helpers
function createKey(schemaName: SchemaName): string | null {
  const user = getMeUser();
  if (!user) return null;
  return createStorageKeyByUser(user, BASE_STORAGE_KEYS[schemaName]);
}
// #endregion
