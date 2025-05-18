import ProfileDetails from '@/components/forms/setup-profile/details';
import ProfileType from '@/components/forms/setup-profile/type';
import KeyboardAvoidingWrapper from '@/components/keyboard-avoider';
import SafeArea from '@/components/safe-area';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { usePagination } from '@/hooks/forms/usePagination';
import { useSetupForm } from '@/hooks/forms/useSetupForm';
import { ICONS, SETUP_PROFILE_STEPS } from '@/lib/constants';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

import ProfileContact from '@/components/forms/setup-profile/contact';
import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import {
  HospitalSchema,
  IndividualSchema,
  MilkBankSchema,
  SetupProfileSchema,
} from '@lactalink/types';
import { FormProvider } from 'react-hook-form';

const steps = SETUP_PROFILE_STEPS;

const individualFields: (keyof IndividualSchema)[] = [
  'givenName',
  'middleName',
  'familyName',
  'dependents',
  'birth',
  'gender',
  'maritalStatus',
];

const hospitalFields: (keyof HospitalSchema)[] = [
  'name',
  'description',
  'head',
  'hospitalID',
  'type',
];

const milkBankFields: (keyof MilkBankSchema)[] = ['name', 'description', 'head', 'type'];

const contactFields: (keyof SetupProfileSchema)[] = ['addresses', 'phone'];

export default function Step() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const { nextPage, hasNextPage, prevPage, hasPrevPage } = usePagination(steps);
  const form = useSetupForm();

  const profileType = form.watch('profileType');

  const typeTitle =
    profileType === 'MILK_BANK'
      ? 'Milk Bank'
      : profileType === 'HOSPITAL'
        ? 'Hospital'
        : 'Personal';

  async function onSubmit(formData: SetupProfileSchema) {
    console.log(formData);
  }

  async function handleNext() {
    if (!hasNextPage) {
      form.handleSubmit(onSubmit);
      return;
    }

    if (step.includes('type')) {
      nextPage();
    } else if (step.includes('details')) {
      let validations: boolean[] = [];
      switch (profileType) {
        case 'INDIVIDUAL':
          validations = await Promise.all(
            individualFields.map((field) => form.trigger(field))
          ).then((result) => result.filter(Boolean));
          if (validations.length === individualFields.length) {
            nextPage();
          }
          break;
        case 'HOSPITAL':
          validations = await Promise.all(hospitalFields.map((field) => form.trigger(field))).then(
            (result) => result.filter(Boolean)
          );
          if (validations.length === individualFields.length) {
            nextPage();
          }
          break;
        case 'MILK_BANK':
          validations = await Promise.all(milkBankFields.map((field) => form.trigger(field))).then(
            (result) => result.filter(Boolean)
          );
          if (validations.length === individualFields.length) {
            nextPage();
          }
          break;
        default:
          break;
      }
    } else {
      const validations = await Promise.all(contactFields.map((field) => form.trigger(field))).then(
        (result) => result.filter(Boolean)
      );
      if (validations.length === contactFields.length) {
        nextPage();
      }
    }
  }

  function handleBack() {
    if (hasPrevPage) {
      prevPage();
    } else {
      router.dismiss();
    }
  }

  return (
    <FormProvider {...form}>
      <SafeArea className="py-5">
        <KeyboardAvoidingWrapper>
          <VStack space="xl" className="relative mt-5 grow px-5">
            <Box className="grow">
              {step.includes('type') && <ProfileType />}

              {!step.includes('type') && (
                <VStack space="lg">
                  <VStack space="sm">
                    <HStack space="md" className="items-center">
                      <Image source={ICONS.information} alt="Information icon" size="xs" />
                      <Text size="xl" bold>
                        {typeTitle} Information
                      </Text>
                    </HStack>
                    <Text>
                      Please take a moment to fill out the fields below. Rest assured, your
                      information is safe with us.
                    </Text>
                  </VStack>

                  {step.includes('details') && <ProfileDetails />}

                  {step.includes('contact') && <ProfileContact />}
                </VStack>
              )}
            </Box>

            <VStack className="mt-5">
              <Button isDisabled={profileType === undefined} size="lg" onPress={handleNext}>
                <ButtonText>{hasNextPage ? 'Continue' : 'Submit'}</ButtonText>
              </Button>
              <Button size="md" variant="link" onPress={handleBack}>
                <ButtonText>Back</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </KeyboardAvoidingWrapper>
      </SafeArea>
    </FormProvider>
  );
}
