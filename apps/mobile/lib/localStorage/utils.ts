import {
  DonationSchema,
  IdentitySchema,
  RequestSchema,
  SetupProfileSchema,
} from '@lactalink/form-schemas';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { DeepPartial } from 'react-hook-form';
import { getMeUser } from '../stores/meUserStore';
import { formDataStorage } from './mmkv-storages';

type Schemas = {
  'donation-create': DonationSchema;
  'identity-create': IdentitySchema;
  'request-create': RequestSchema;
  'profile-create': SetupProfileSchema;
};

type SchemaName = keyof Schemas;

type Schema<TName extends SchemaName> = Schemas[TName];

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

function createKey(schemaName: SchemaName): string | null {
  const user = getMeUser();
  if (!user) return null;
  return createStorageKeyByUser(user, BASE_STORAGE_KEYS[schemaName]);
}
