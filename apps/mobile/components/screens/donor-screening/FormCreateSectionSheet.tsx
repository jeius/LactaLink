import SectionSheet from '@/features/donor-screening/components/ScreeningForm/SectionSheet';
import { FormCreateSearchParams } from '@/features/donor-screening/lib/types';
import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FieldArrayPath } from 'react-hook-form';

export default function FormCreateSectionSheet() {
  const router = useRouter();
  const { name } = useLocalSearchParams<FormCreateSearchParams>();

  useEffect(() => {
    if (!validateName(name)) router.back();
  }, [name, router]);

  if (!validateName(name)) return null;

  return <SectionSheet name={name} />;
}

function validateName(name: unknown): name is FieldArrayPath<DonorScreeningFormSchema> {
  return typeof name === 'string' && name.trim().startsWith('sections');
}
