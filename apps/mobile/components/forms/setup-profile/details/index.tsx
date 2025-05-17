import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import {
  HospitalSchema,
  IndividualSchema,
  MilkBankSchema,
  SetupProfileSchema,
} from '@lactalink/types';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import IndividualDetails from './individual-details';

export default function ProfileDetails({ form }: { form: UseFormReturn<SetupProfileSchema> }) {
  const { watch } = form;

  const profileType = watch('profileType');

  function isForm<T extends IndividualSchema | HospitalSchema | MilkBankSchema>(
    formParam: typeof form,
    type: SetupProfileSchema['profileType']
    //@ts-expect-error addresses and phone are declared in form but is not needed here
  ): formParam is UseFormReturn<T> {
    const profileType = formParam.getValues('profileType');
    return profileType === type;
  }

  return (
    <Card>
      <VStack>
        {isForm<IndividualSchema>(form, 'INDIVIDUAL') && <IndividualDetails form={form} />}
      </VStack>
    </Card>
  );
}
