import { AnimatedProgress } from '@/components/animated/progress';
import FormSaver from '@/components/forms/FormSaver';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import KeyboardOffsetProvider from '@/features/profile/components/KeyboardOffsetContext';
import { useCreateProfileMutation } from '@/features/profile/hooks/mutations';
import { useProfileSetupNavigator } from '@/features/profile/hooks/useProfileSetupNavigator';
import { useSetupProfileForm } from '@/features/profile/hooks/useSetupForm';
import {
  AVATAR_FIELDS,
  CONTACT_FIELDS,
  DETAILS_FIELDS,
  TYPE_FIELDS,
} from '@/features/profile/lib/constants';
import { SetupProfileFields } from '@/features/profile/lib/types';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { deleteSavedFormData } from '@/lib/localStorage/utils';
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

export default function Layout() {
  const router = useRouter();
  const { data: user } = useMeUser();
  const insets = useSafeAreaInsets();
  const screenOptions = useScreenOptions({ animationType: 'slide' });

  const [navBtnContainerSize, setNavBtnContainerSize] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const form = useSetupProfileForm();
  const { handleSubmit, trigger } = form;
  const profileType = useWatch({ control: form.control, name: 'profileType' });

  const { mutateAsync: createProfile } = useCreateProfileMutation();

  async function onSubmit(formData: SetupProfileSchema) {
    const create = async () => {
      if (!user) throw new Error('User not found.');

      const createdProfile = await createProfile(formData);
      const name = createdProfile.value.displayName;

      deleteSavedFormData('profile-create');
      router.replace('/feed');

      return name ? `Welcome to LactaLink ${name}!` : 'Profile created successfully!';
    };

    toast.promise(create(), {
      loading: 'Creating profile...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });
  }

  const { goToNextStep, goToPrevStep, isIntro, hasNextPage, progress } = useProfileSetupNavigator({
    onSubmit: handleSubmit(onSubmit),
    validate: async (currentStep) => {
      const fieldNames: SetupProfileFields = {
        type: TYPE_FIELDS,
        details: DETAILS_FIELDS[profileType],
        contact: CONTACT_FIELDS,
        avatar: AVATAR_FIELDS,
      };

      return trigger(fieldNames[currentStep]);
    },
  });

  return (
    <FormProvider {...form}>
      <KeyboardOffsetProvider {...navBtnContainerSize}>
        <FormSaver schemaName="profile-create" />

        {/* Progress Indicator */}
        <Animated.View
          /**Omit animations for now since there is an issue @https://github.com/software-mansion/react-native-reanimated/issues/8422#issuecomment-3547104492 */
          // entering={FadeInUp}
          // exiting={FadeOutUp}
          className="px-5"
          style={{ marginTop: insets.top }}
        >
          <AnimatedProgress size="sm" value={progress} hidden={isIntro} />
        </Animated.View>

        {/* Forms */}
        <Box className="flex-1">
          <Stack screenOptions={screenOptions} />
        </Box>

        {/* Navigation Buttons */}
        <AnimationWrapper hidden={isIntro}>
          <VStack
            className="w-full rounded-2xl border border-outline-300 bg-background-0 p-4"
            onLayout={(e) => setNavBtnContainerSize(e.nativeEvent.layout)}
            style={{
              paddingBottom: Math.max(insets.bottom, 16),
              ...createDirectionalShadow('top'),
            }}
          >
            <Button isDisabled={!profileType} size="lg" onPress={goToNextStep}>
              <ButtonText>{hasNextPage ? 'Continue' : 'Submit'}</ButtonText>
            </Button>
            <Button size="md" variant="link" action="default" onPress={goToPrevStep}>
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
