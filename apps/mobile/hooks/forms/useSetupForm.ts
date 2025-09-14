import { setupProfileStorage as storage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { SetupProfileSchema, setupProfileSchema } from '@lactalink/form-schemas';

import { User } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';

import debounce from 'lodash/debounce';

import { useEffect, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';

const storageKeyPrefix = 'setup-profile-form';

export function useSetupForm(user: User) {
  const storageKey = createStorageKeyByUser(user, storageKeyPrefix);

  const initialData = useMemo<DeepPartial<SetupProfileSchema> | undefined>(() => {
    const raw = storage.getString(storageKey);
    return raw && JSON.parse(raw);
  }, [storageKey]);

  const form = useForm<SetupProfileSchema>({
    resolver: zodResolver(setupProfileSchema),
    mode: 'onTouched',
    defaultValues: initialData || {
      familyName: '',
      givenName: '',
      middleName: '',
      name: '',
      description: '',
      phone: '',
      head: '',
      hospitalID: '',
      birth: '',
      gender: 'FEMALE',
      maritalStatus: 'MARRIED',
    },
  });

  const debouncedSave = debounce((value: DeepPartial<SetupProfileSchema>) => {
    storage.set(storageKey, JSON.stringify(value));
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      debouncedSave(value);
    });

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch, debouncedSave]);

  return form;
}
