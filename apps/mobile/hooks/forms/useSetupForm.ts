import { MMKV_KEYS } from '@/lib/constants';
import storage from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { SetupProfileSchema, setupProfileSchema } from '@lactalink/types';
import { useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';

const STORAGE_KEY = MMKV_KEYS.SETUP_PROFILE;

function getInitialData(): SetupProfileSchema | undefined {
  const raw = storage.getString(STORAGE_KEY);
  const data: SetupProfileSchema = raw ? JSON.parse(raw) : null;

  if (data && data.profileType === 'INDIVIDUAL') {
    const birth = data.birth;
    return { ...data, birth: new Date(birth) };
  }
}

export const useSetupForm = (): UseFormReturn<SetupProfileSchema> => {
  const initialData = getInitialData();

  // Create form instance
  const methods = useForm<SetupProfileSchema>({
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
    },
  });

  // Sync form state to MMKV & Query Cache
  useEffect(() => {
    const subscription = methods.watch((value) => {
      storage.set(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [methods, methods.watch]);

  return methods;
};
