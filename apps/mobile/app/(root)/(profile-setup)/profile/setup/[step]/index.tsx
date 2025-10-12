import ProfileAvatar from '@/components/forms/setup-profile/avatar';
import ProfileContact from '@/components/forms/setup-profile/contact';
import ProfileDetails from '@/components/forms/setup-profile/details';
import ProfileTypeForm from '@/components/forms/setup-profile/type';
import { Image } from '@/components/Image';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { useAuth } from '@/hooks/auth/useAuth';
import { usePagination } from '@/hooks/forms/usePagination';
import { deleteCollection } from '@/lib/api/delete';

import { uploadImage } from '@/lib/api/file';
import { createProfile } from '@/lib/api/profile/createProfile';
import {
  AVATAR_FIELDS,
  CONTACT_FIELDS,
  DETAILS_FIELDS,
  SETUP_PROFILE_STEPS,
  TYPE_FIELDS,
} from '@/lib/constants/profile';
import { deleteSavedFormData } from '@/lib/localStorage/utils';
import { getIconAsset } from '@/lib/stores';
import { ProfileType, SetupProfileFields, SetupProfileSteps } from '@/lib/types/profile';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { SetupProfileSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';

import { router, useLocalSearchParams } from 'expo-router';
import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

const STEPS = createDynamicRoute('/profile/setup', SETUP_PROFILE_STEPS);

type Block = Record<SetupProfileSteps, FC>;

export default function Step() {
  const { user, refetchSession } = useAuth();
  const insets = useSafeAreaInsets();
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

  async function onSubmit(formData: SetupProfileSchema) {
    const createPromise = async () => {
      if (!user) throw new Error('User not found.');

      const { avatar, ...rest } = formData;

      const avatarDoc = avatar && (await uploadImage('avatars', avatar));

      const createdProfile = await createProfile({
        ...rest,
        avatar: avatarDoc,
      }).catch(async (error) => {
        await deleteCollection('avatars', avatarDoc?.id, { silent: true });
        throw error;
      });

      const name = createdProfile.displayName;

      deleteSavedFormData('profile-create');
      await refetchSession({ throwOnError: true });
      router.replace('/feed');

      return name ? `Welcome to LactaLink ${name}!` : 'Profile created successfully!';
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
    <SafeArea safeBottom={false}>
      {step === 'contact' ? (
        <VStack space="xl" className="relative mb-5 flex-1 pt-10">
          <VStack space="lg" className="flex-1">
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
                Please take a moment to fill out the fields below. Rest assured, your information is
                safe with us.
              </Text>
            </VStack>

            <RenderBlock />
          </VStack>
        </VStack>
      ) : (
        <KeyboardAwareScrollView className="flex-1" contentContainerClassName="grow">
          <VStack space="xl" className="relative mb-5 flex-1 justify-between pt-10">
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
          </VStack>
        </KeyboardAwareScrollView>
      )}

      <VStack
        className="bg-background-0 border-outline-300 w-full rounded-2xl border p-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Button isDisabled={!profileType} size="lg" onPress={handleNext}>
          <ButtonText>{hasNextPage ? 'Continue' : 'Submit'}</ButtonText>
        </Button>
        <Button size="md" variant="link" action="default" onPress={handleBack}>
          <ButtonText>Back</ButtonText>
        </Button>
      </VStack>
    </SafeArea>
  );
}
