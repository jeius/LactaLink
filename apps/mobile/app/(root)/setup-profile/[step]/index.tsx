import ProfileAvatar from '@/components/forms/setup-profile/avatar';
import ProfileContact from '@/components/forms/setup-profile/contact';
import ProfileDetails from '@/components/forms/setup-profile/details';
import ProfileTypeForm from '@/components/forms/setup-profile/type';
import KeyboardAvoidingWrapper from '@/components/keyboard-avoider';
import SafeArea from '@/components/safe-area';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { useSession } from '@/hooks/auth/useSession';
import { usePagination } from '@/hooks/forms/usePagination';
import { useSetupForm } from '@/hooks/forms/useSetupForm';
import { useAppToast } from '@/hooks/useAppToast';

import { API_URL, ICONS, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import {
  AVATAR_FIELDS,
  CONTACT_FIELDS,
  DETAILS_FIELDS,
  SETUP_PROFILE_STEPS,
  TYPE_FIELDS,
} from '@/lib/constants/setupProfile';
import { ProfileType, SetupProfileFields, SetupProfileSteps } from '@/lib/types/profile';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';
import { uploadFile } from '@/lib/utils/file';
import { createAddresses } from '@/lib/utils/profile/createAddresses';
import { createProfile } from '@/lib/utils/profile/createProfile';

import { SetupProfileSchema, User } from '@lactalink/types';
import { extractErrorMessage, updateDocByID } from '@lactalink/utilities';

import { router, useLocalSearchParams } from 'expo-router';
import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

const STEPS = createDynamicRoute('/setup-profile', SETUP_PROFILE_STEPS);

type Block = Record<SetupProfileSteps, FC>;

export default function Step() {
  const { token, user, refetchSession } = useSession();
  const toast = useAppToast();
  const { step } = useLocalSearchParams<{ step: SetupProfileSteps }>();
  const { nextPage, hasNextPage, prevPage, hasPrevPage } = usePagination(STEPS);
  const { cleanUpForm } = useSetupForm();
  const form = useFormContext<SetupProfileSchema>();

  const profileType = form.getValues('profileType');

  const title: Record<ProfileType, string> = {
    INDIVIDUAL: 'Personal',
    HOSPITAL: 'Hospital',
    MILK_BANK: 'Milk Bank',
  };

  const block: Block = {
    type: ProfileTypeForm,
    details: ProfileDetails,
    contact: ProfileContact,
    avatar: ProfileAvatar,
  };

  const RenderBlock = block[step];

  async function onSubmit(formData: SetupProfileSchema) {
    toast.show({
      id: 'setup-profile',
      message: 'Creating profile...',
      type: 'loading',
    });

    const baseOptions = { apiUrl: API_URL, vercelToken: VERCEL_BYPASS_TOKEN, token };
    const createOptions = {
      ...baseOptions,
      depth: 0,
      select: { id: true, displayName: true },
    };

    try {
      if (!user) throw new Error('User not found.');

      const { addresses, avatar, ...rest } = formData;

      const avatarDoc =
        avatar &&
        (await uploadFile(
          { name: avatar.filename!, uri: avatar.url!, type: avatar.mimeType! },
          { ...baseOptions, collection: 'avatars' }
        ));
      const avatarID = avatarDoc?.id || null;

      const addressDocs = await createAddresses(addresses, createOptions);

      const createdProfile = await createProfile(
        {
          ...rest,
          avatar: avatarID,
          addresses: addressDocs.map((a) => a.id),
        },
        createOptions
      );

      const profileMap: Record<ProfileType, User['profile']> = {
        INDIVIDUAL: { relationTo: 'individuals', value: createdProfile.id },
        HOSPITAL: { relationTo: 'hospitals', value: createdProfile.id },
        MILK_BANK: { relationTo: 'milkBanks', value: createdProfile.id },
      };

      await updateDocByID<User>(user.id, {
        ...baseOptions,
        depth: 1,
        collection: 'users',
        data: {
          profileType,
          profile: profileMap[profileType],
        },
      });

      toast.show({
        id: 'setup-profile',
        type: 'success',
        message: 'Profile created successfully.',
      });

      cleanUpForm();
      await refetchSession({ throwOnError: true });
      router.dismissTo('/home');
    } catch (error) {
      console.error('Submit', error);
      toast.show({
        id: 'setup-profile',
        type: 'error',
        message: extractErrorMessage(error),
      });
    }
  }

  async function handleNext() {
    if (!hasNextPage) {
      form.handleSubmit(onSubmit)();
      return;
    }

    const profileFields: SetupProfileFields = {
      type: TYPE_FIELDS,
      details: DETAILS_FIELDS[profileType],
      contact: CONTACT_FIELDS,
      avatar: AVATAR_FIELDS,
    };

    const validationResults = await Promise.all(
      profileFields[step].map((field) => form.trigger(field))
    );

    const allValid = validationResults.every(Boolean);

    if (allValid) nextPage();
  }

  function handleBack() {
    if (hasPrevPage) {
      prevPage();
    } else {
      router.dismiss();
    }
  }

  return (
    <SafeArea className="py-5">
      <KeyboardAvoidingWrapper>
        <VStack space="xl" className="relative mt-5 grow px-5">
          <Box className="grow">
            {step === 'type' ? (
              <RenderBlock />
            ) : (
              <VStack space="lg">
                <VStack space="sm">
                  <HStack space="md" className="items-center">
                    <Image source={ICONS.information} alt="Information icon" size="xs" />
                    <Text size="xl" bold>
                      {title[profileType]} Information
                    </Text>
                  </HStack>
                  <Text>
                    Please take a moment to fill out the fields below. Rest assured, your
                    information is safe with us.
                  </Text>
                </VStack>

                <RenderBlock />
              </VStack>
            )}
          </Box>

          <VStack className="mt-5">
            <Button isDisabled={!profileType} size="lg" onPress={handleNext}>
              <ButtonText>{hasNextPage ? 'Continue' : 'Submit'}</ButtonText>
            </Button>
            <Button size="md" variant="link" action="default" onPress={handleBack}>
              <ButtonText>Back</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </KeyboardAvoidingWrapper>
    </SafeArea>
  );
}
