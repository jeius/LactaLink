import { setupProfileStorage as storage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { SetupProfileSchema, setupProfileSchema, User } from '@lactalink/types';
import { debounce } from 'lodash';
import { useEffect } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';

const storageKeyPrefix = 'setup-profile-form';

function getInitialData(id?: string): DeepPartial<SetupProfileSchema> | undefined {
  if (!id) return;
  const storageKey = `${storageKeyPrefix}-${id}`;
  const raw = storage.getString(storageKey);
  return raw && JSON.parse(raw);
}

export function useSetupForm(user: User) {
  const initialData = getInitialData(user?.id);

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

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;

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
