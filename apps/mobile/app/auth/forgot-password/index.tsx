import { resetPassword } from '@/auth';
import { FormField } from '@/components/form-field';
import KeyboardAvoidingWrapper from '@/components/keyboard-avoider';
import { useTheme } from '@/components/providers/theme-provider';
import SafeArea from '@/components/safe-area';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getHexColor } from '@/lib/colors';
import { ASSET_IMAGES } from '@/lib/constants/images';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities';
import { router } from 'expo-router';
import { ChevronLeftIcon, MailIcon } from 'lucide-react-native';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Dimensions } from 'react-native';
import { toast } from 'sonner-native';
import { z } from 'zod';

const schema = z.object({ email: emailSchema });
type Schema = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { height } = Dimensions.get('window');
  const { theme } = useTheme();

  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit({ email }: Schema) {
    toast.promise(resetPassword(email), {
      loading: 'Requesting reset...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });
  }

  return (
    <SafeArea className="items-stretch">
      <KeyboardAvoidingWrapper contentContainerStyle={{ justifyContent: 'center' }}>
        <VStack className="m-5">
          <Card className="p-0">
            <Box className="relative w-full overflow-hidden" style={{ height: height * 0.25 }}>
              <Image
                size="full"
                resizeMode="cover"
                className="h-80"
                alt="Forgot Password"
                source={ASSET_IMAGES.forgotPassword}
              />
              <GradientBackground colors={gradientColors} className="opacity-40" />
            </Box>

            <VStack>
              <VStack space="sm" className="p-5">
                <Text bold size="2xl">
                  Forgot your password?
                </Text>
                <HStack className="flex-wrap items-center">
                  <Text size="md" className="text-typography-700">
                    Enter the email address that you want to reset the password.
                  </Text>
                </HStack>
              </VStack>
            </VStack>

            <VStack space="3xl" className="p-5 pt-0">
              <FormProvider {...form}>
                <FormField
                  name="email"
                  inputType="text"
                  variant="underlined"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  inputIcon={MailIcon}
                />
              </FormProvider>

              <Button
                isDisabled={isSubmitting}
                size="lg"
                variant="solid"
                action="primary"
                onPress={form.handleSubmit(onSubmit)}
              >
                <ButtonText>{isSubmitting ? 'Requesting...' : 'Request Reset'}</ButtonText>
              </Button>
            </VStack>
          </Card>

          <HStack>
            <Button variant="link" action="default" size="md" onPress={() => router.dismiss()}>
              <ButtonIcon as={ChevronLeftIcon} />
              <ButtonText>Back to sign in</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </KeyboardAvoidingWrapper>
    </SafeArea>
  );
}
