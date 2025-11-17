import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { VStack } from '@/components/ui/vstack';
import HospitalForm from '@/features/profile/components/HospitalForm';
import MilkBankForm from '@/features/profile/components/MilkBankForm';
import PageTitle from '@/features/profile/components/PageTitle';
import PersonalForm from '@/features/profile/components/PersonalForm';
import { ProfileType } from '@/lib/types';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import React, { createElement, FC } from 'react';
import { Control, useFormContext, useWatch } from 'react-hook-form';

const forms: Record<ProfileType, FC<{ control: Control<SetupProfileSchema> }>> = {
  HOSPITAL: HospitalForm,
  INDIVIDUAL: PersonalForm,
  MILK_BANK: MilkBankForm,
};

export default function ProfileDetails() {
  const { control } = useFormContext<SetupProfileSchema>();
  const profileType = useWatch({ control, name: 'profileType' });
  return (
    <KeyboardAvoidingScrollView className="flex-1" contentContainerClassName="grow">
      <PageTitle className="mb-4 px-5" />

      {profileType && <VStack space="lg">{createElement(forms[profileType], { control })}</VStack>}
    </KeyboardAvoidingScrollView>
  );
}
