import { resetPassword } from '@/auth';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { FormField } from '@/components/FormField';
import KeyboardAvoidingWrapper from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { getHexColor } from '@/lib/colors';
import { getImageAsset } from '@/lib/stores';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';

import { Image } from 'expo-image';
import { router } from 'expo-router';

import { ChevronLeftIcon, MailIcon } from 'lucide-react-native';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner-native';
import * as z from 'zod/v4';

const schema = z.object({ email: emailSchema });
type Schema = z.infer<typeof schema>;

export default function ForgotPassword() {
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
    const resetPromise = resetPassword(email);

    toast.promise(resetPromise, {
      loading: 'Requesting reset...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });

    await resetPromise;
  }

  return (
    <SafeArea>
      <KeyboardAvoidingWrapper contentContainerClassName="grow p-5 justify-center">
        <VStack>
          <Card className="p-0">
            <Box className="relative w-full overflow-hidden" style={{ aspectRatio: 1.75 }}>
              <Image
                contentFit="cover"
                contentPosition={{ top: -20 }}
                style={{ height: '100%', width: '100%' }}
                alt="Forgot Password Image"
                source={getImageAsset('forgotPassword')}
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
                  fieldType="text"
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
