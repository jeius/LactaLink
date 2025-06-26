import ProfileAvatar from '@/components/forms/setup-profile/avatar';
import ProfileContact from '@/components/forms/setup-profile/contact';
import ProfileDetails from '@/components/forms/setup-profile/details';
import ProfileTypeForm from '@/components/forms/setup-profile/type';
import { Image } from '@/components/Image';
import KeyboardAvoidingWrapper from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { useAuth } from '@/hooks/auth/useAuth';
import { usePagination } from '@/hooks/forms/usePagination';

import { uploadImage } from '@/lib/api/file';
import { createAddresses } from '@/lib/api/profile/createAddresses';
import { createProfile } from '@/lib/api/profile/createProfile';
import {
  AVATAR_FIELDS,
  CONTACT_FIELDS,
  DETAILS_FIELDS,
  SETUP_PROFILE_STEPS,
  TYPE_FIELDS,
} from '@/lib/constants/profile';
import { setupProfileStorage } from '@/lib/localStorage';
import { getIconAsset } from '@/lib/stores';
import { ProfileType, SetupProfileFields, SetupProfileSteps } from '@/lib/types/profile';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { useApiClient } from '@lactalink/api';
import { SetupProfileSchema, User } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities';

import { router, useLocalSearchParams } from 'expo-router';
import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner-native';

const STEPS = createDynamicRoute('/setup-profile', SETUP_PROFILE_STEPS);

type Block = Record<SetupProfileSteps, FC>;

export default function Step() {
  const { user, refetchSession } = useAuth();
  const apiClient = useApiClient();
  const { step } = useLocalSearchParams<{ step: SetupProfileSteps }>();
  const { nextPage, hasNextPage, prevPage, hasPrevPage } = usePagination(STEPS);

  const form = useFormContext<SetupProfileSchema>();
  const profileType = form.getValues('profileType');

  const title: Record<ProfileType, string> = {
    INDIVIDUAL: 'Personal',
    HOSPITAL: 'Hospital',
    MILK_BANK: 'Milk Bank',
  };

  const block: Block = {
    type: ProfileTypeForm,
    details: () => <ProfileDetails profileType={profileType} />,
    contact: ProfileContact,
    avatar: ProfileAvatar,
  };

  const RenderBlock = block[step];

  const cleanUpForm = () => setupProfileStorage.clearAll();

  async function onSubmit(formData: SetupProfileSchema) {
    const createPromise = async () => {
      if (!user) throw new Error('User not found.');

      const { addresses, avatar, ...rest } = formData;

      const avatarDoc = avatar && (await uploadImage('avatars', avatar));
      const addressDocs = await createAddresses(addresses);

      const createdProfile = await createProfile({
        ...rest,
        avatar: avatarDoc,
        addresses: addressDocs,
      });

      const profileMap: Record<ProfileType, User['profile']> = {
        INDIVIDUAL: { relationTo: 'individuals', value: createdProfile.id },
        HOSPITAL: { relationTo: 'hospitals', value: createdProfile.id },
        MILK_BANK: { relationTo: 'milkBanks', value: createdProfile.id },
      };

      await apiClient.updateByID({
        collection: 'users',
        id: user.id,
        depth: 0,
        data: {
          profileType: formData.profileType,
          profile: profileMap[formData.profileType],
        },
      });

      cleanUpForm();
      await refetchSession({ throwOnError: true });
      router.dismissTo('/home');

      return 'Profile created successfully!';
    };

    toast.promise(createPromise(), {
      loading: 'Creating profile...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });
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

    const allValid = await form.trigger(profileFields[step]);

    if (allValid) {
      nextPage();
    } else {
      toast.error('There are some invalid fields. Please fix them before proceeding.');
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
    <SafeArea>
      <KeyboardAvoidingWrapper>
        <VStack space="xl" className="relative grow pb-5 pt-10">
          <Box className="grow">
            {step === 'type' ? (
              <RenderBlock />
            ) : (
              <VStack space="lg">
                <VStack space="sm" className="px-5">
                  <HStack space="md" className="items-center">
                    <Image
                      source={getIconAsset('information')}
                      alt="Information"
                      style={{ width: 40, height: 40 }}
                    />
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

          <VStack className="mx-5 mt-5">
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
