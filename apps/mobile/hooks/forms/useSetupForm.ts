import { getSavedFormData, saveFormData } from '@/lib/localStorage/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { GENDER_TYPES, MARITAL_STATUS } from '@lactalink/enums';
import { SetupProfileSchema, setupProfileSchema } from '@lactalink/form-schemas';

import debounce from 'lodash/debounce';

import { useEffect } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';

const debouncedSave = debounce((value) => saveFormData('profile-create', value));

export function useSetupForm() {
  const form = useForm<SetupProfileSchema>({
    resolver: zodResolver(setupProfileSchema),
    mode: 'onTouched',
    defaultValues: createDefaultValues(),
  });

  const { watch } = form;

  useEffect(() => {
    const subscription = watch(debouncedSave);

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };
  }, [watch]);

  return form;
}

function createDefaultValues(): SetupProfileSchema {
  const savedData = getSavedFormData('profile-create');

  if (savedData) return savedData as SetupProfileSchema;

  const defaultVal: DeepPartial<SetupProfileSchema> = {
    familyName: '',
    givenName: '',
    middleName: '',
    name: '',
    description: '',
    phone: '',
    head: '',
    hospitalID: '',
    birth: '',
    gender: GENDER_TYPES.FEMALE.value,
    maritalStatus: MARITAL_STATUS.MARRIED.value,
  };

  return defaultVal as SetupProfileSchema;
}
