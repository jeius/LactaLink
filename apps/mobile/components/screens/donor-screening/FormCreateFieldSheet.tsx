import FieldSheet from '@/features/donor-screening/components/ScreeningForm/FieldSheet';
import { FormCreateSearchParams } from '@/features/donor-screening/lib/types';
import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FieldArrayPath } from 'react-hook-form';

export default function FormCreateFieldSheet() {
  const router = useRouter();
  const { name } = useLocalSearchParams<FormCreateSearchParams>();

  useEffect(() => {
    if (!validateName(name)) router.back();
  }, [name, router]);

  if (!validateName(name)) return null;

  return <FieldSheet name={name} />;
}

function validateName(name: unknown): name is FieldArrayPath<DonorScreeningFormSchema> {
  return (
    typeof name === 'string' &&
    (name.trim().startsWith('fields') || name.trim().startsWith('sections'))
  );
}
