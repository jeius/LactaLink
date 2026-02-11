import { AnimatedProgress } from '@/components/animated/progress';
import FormSaver from '@/components/forms/FormSaver';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import KeyboardOffsetProvider from '@/features/profile/components/KeyboardOffsetContext';
import { useSetupProfileForm } from '@/features/profile/hooks/useSetupForm';
import {
  AVATAR_FIELDS,
  CONTACT_FIELDS,
  DETAILS_FIELDS,
  SETUP_PROFILE_STEPS,
  TYPE_FIELDS,
} from '@/features/profile/lib/constants';
import { SetupProfileFields, SetupProfileSteps } from '@/features/profile/types';
import { useAuth } from '@/hooks/auth/useAuth';
import { usePagination } from '@/hooks/forms/usePagination';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { deleteCollection } from '@/lib/api/delete';
import { uploadImage } from '@/lib/api/file';
import { createProfile } from '@/lib/api/profile/createProfile';
import { deleteSavedFormData } from '@/lib/localStorage/utils';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Stack, useRouter } from 'expo-router';
import React, { PropsWithChildren, useState } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { LayoutRectangle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

const STEPS = createDynamicRoute('/profile/setup', SETUP_PROFILE_STEPS);

export default function Layout() {
  const router = useRouter();
  const { user, refetchSession } = useAuth();
  const insets = useSafeAreaInsets();
  const screenOptions = useScreenOptions({ animationType: 'slide' });

  const { nextPage, hasNextPage, prevPage, hasPrevPage, progress, currentPageIndex, pathname } =
    usePagination(STEPS);

  const isInOnboarding = currentPageIndex < 0;

  const [ctaSize, setCtaSize] = useState<LayoutRectangle>({ x: 0, y: 0, width: 0, height: 0 });

  const form = useSetupProfileForm();
  const { handleSubmit, trigger } = form;
  const profileType = useWatch({ control: form.control, name: 'profileType' });

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
      handleSubmit(onSubmit)();
      return;
    }

    const currentStep = pathname.split('/').pop() as SetupProfileSteps | undefined;

    if (!currentStep) {
      toast.error('An unexpected error occurred. Please try again.');
      return;
    }

    const fieldNames: SetupProfileFields = {
      type: TYPE_FIELDS,
      details: DETAILS_FIELDS[profileType],
      contact: CONTACT_FIELDS,
      avatar: AVATAR_FIELDS,
    };

    const allValid = await trigger(fieldNames[currentStep]);

    if (allValid) {
      nextPage();
    } else {
      toast.error('There are some invalid fields. Please fix them before proceeding.');
    }
  }

  function handleBack() {
    if (hasPrevPage) prevPage();
    else router.back();
  }

  return (
    <FormProvider {...form}>
      <KeyboardOffsetProvider {...ctaSize}>
        <FormSaver schemaName="profile-create" />

        <Animated.View
          /**Omit animations for now since there is an issue @https://github.com/software-mansion/react-native-reanimated/issues/8422#issuecomment-3547104492 */
          // entering={FadeInUp}
          // exiting={FadeOutUp}
          className="px-5"
          style={{ marginTop: insets.top }}
        >
          <AnimatedProgress size="sm" value={progress} hidden={isInOnboarding} />
        </Animated.View>

        <Box className="flex-1">
          <Stack screenOptions={screenOptions} />
        </Box>

        <AnimationWrapper hidden={isInOnboarding}>
          <VStack
            className="w-full rounded-2xl border border-outline-300 bg-background-0 p-4"
            style={{
              paddingBottom: Math.max(insets.bottom, 16),
              ...createDirectionalShadow('top'),
            }}
            onLayout={(e) => setCtaSize(e.nativeEvent.layout)}
          >
            <Button isDisabled={!profileType} size="lg" onPress={handleNext}>
              <ButtonText>{hasNextPage ? 'Continue' : 'Submit'}</ButtonText>
            </Button>
            <Button size="md" variant="link" action="default" onPress={handleBack}>
              <ButtonText>Back</ButtonText>
            </Button>
          </VStack>
        </AnimationWrapper>
      </KeyboardOffsetProvider>
    </FormProvider>
  );
}

function AnimationWrapper({ children, hidden }: PropsWithChildren<{ hidden?: boolean }>) {
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = withTiming(hidden ? 20 : 0, { duration: 300 });
    const opacity = withTiming(hidden ? 0 : 1, { duration: 300 });
    return { transform: [{ translateY }], opacity };
  }, [hidden]);

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
