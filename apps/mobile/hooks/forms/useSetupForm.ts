import storage from '@/lib/localStorage';
import { zodResolver } from '@hookform/resolvers/zod';
import { SetupProfileSchema, setupProfileSchema } from '@lactalink/types';
import { useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useSession } from '../auth/useSession';

const storageKeyPrefix = 'setup-profile-form';

function getInitialData(id?: string): SetupProfileSchema | undefined {
  if (!id) return;

  const raw = storage.getString(`${storageKeyPrefix}-${id}`);
  const data: SetupProfileSchema = raw ? JSON.parse(raw) : null;

  if (data && data.profileType === 'INDIVIDUAL') {
    const birth = data.birth;
    return { ...data, birth: new Date(birth) };
  }
}

export const useSetupForm = (): UseFormReturn<SetupProfileSchema> => {
  const { user } = useSession();

  const initialData = getInitialData(user?.id);

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
      birth: undefined,
    },
  });

  // Sync form state to MMKV
  useEffect(() => {
    const subscription = methods.watch((value) => {
      if (user) storage.set(`${storageKeyPrefix}-${user.id}`, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [methods, methods.watch, user]);

  return methods;
};
