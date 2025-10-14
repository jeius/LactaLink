import { useForm } from '@/components/contexts/FormProvider';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { IdentitySchema } from '@lactalink/form-schemas';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';

export default function IDVerificationStepsLayout() {
  const screenOptions = useScreenOptions({ animationType: 'slide' });

  const { id } = useLocalSearchParams<{ id?: string }>();
  const { reset, getValues } = useForm<IdentitySchema>();

  useEffect(() => {
    reset({ ...getValues(), id });
  }, [id, reset, getValues]);

  return (
    <Stack
      initialRouteName="id-type"
      screenOptions={{
        ...screenOptions,
      }}
    />
  );
}
