import { useAuth } from '@/hooks/auth/useAuth';
import { setupProfileStorage as storage } from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { SetupProfileSchema, setupProfileSchema } from '@lactalink/types';
import { useDebouncedCallback } from '@lactalink/utilities';
import { useEffect } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';

const storageKeyPrefix = 'setup-profile-form';

function getInitialData(id?: string): SetupProfileSchema | undefined {
  if (!id) return;
  const storageKey = `${storageKeyPrefix}-${id}`;
  const raw = storage.getString(storageKey);
  return raw && JSON.parse(raw);
}

export function useSetupForm() {
  const { user } = useAuth();
  const initialData = getInitialData(user?.id);

  // Create form instance
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
      addresses: [],
    },
  });

  const storageKey = `${storageKeyPrefix}-${user?.id || ''}`;

  function cleanUpForm() {
    storage.delete(storageKey);
  }

  const { debounced: debouncedSave, cancel } = useDebouncedCallback(
    (value: DeepPartial<SetupProfileSchema>) => {
      storage.set(storageKey, JSON.stringify(value));
    }
  );

  useEffect(() => {
    const subscription = form.watch((value) => {
      debouncedSave(value);
    });

    return () => {
      subscription.unsubscribe();
      cancel(); // cancel pending debounced calls
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch, debouncedSave, cancel]);

  return { form, cleanUpForm };
}
