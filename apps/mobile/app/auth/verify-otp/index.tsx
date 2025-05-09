import Logo from '@/assets/svgs/logo.svg';
import VerifyImage from '@/assets/svgs/verification.svg';
import OTPForm from '@/components/forms/otp';
import { useTheme } from '@/components/providers/theme-provider';
import SafeArea from '@/components/safe-area';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { getHexColor } from '@/lib/colors';
import { RESEND_OTP } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { errorToast, loadingToast, successToast } from '@/lib/toaster';
import { formatTime } from '@lactalink/utilities';
import { AuthError, VerifyOtpParams } from '@supabase/supabase-js';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeftIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export default function VerifyOTP() {
  const { width, height } = Dimensions.get('window');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const toast = useToast();
  const { theme } = useTheme();
  const { email: emailParams, type: typeParams, phone: phoneParams } = useLocalSearchParams();

  const email = Array.isArray(emailParams) ? emailParams[0] : emailParams;
  const phone = Array.isArray(phoneParams) ? phoneParams[0] : phoneParams;
  const type = (Array.isArray(typeParams) ? typeParams[0] : typeParams) as VerifyOtpParams['type'];

  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  const sendOTP = useCallback(async () => {
    if (secondsLeft > 0) return;

    const showToast = (type: 'loading' | 'error' | 'success', message: string) => {
      const renderers = {
        loading: loadingToast,
        error: errorToast,
        success: successToast,
      };

      toast.show({
        id: 'otp',
        placement: 'top',
        duration: type === 'loading' ? null : undefined,
        render: ({ id }) => renderers[type](id, message, theme),
      });
    };

    setIsSending(true);
    showToast('loading', 'Sending verification code...');

    let error: AuthError | null = null;

    try {
      if (email) {
        if (type === 'signup' || type === 'email_change') {
          error = (await supabase.auth.resend({ email, type })).error;
        } else if (type === 'recovery') {
          error = (await supabase.auth.resetPasswordForEmail(email)).error;
        }
      } else if (phone) {
        if (type === 'sms' || type === 'phone_change') {
          error = (await supabase.auth.resend({ phone, type })).error;
        }
      }

      if (error) {
        showToast('error', error.message);
        return;
      }

      showToast('success', `Verification sent to your ${email ? 'email' : 'inbox'}.`);
      setSecondsLeft(RESEND_OTP);
    } finally {
      setIsSending(false);
    }
  }, [email, phone, type, secondsLeft, theme, toast]);

  useEffect(() => {
    if (!typeParams) {
      toast.show({
        id: 'otp',
        placement: 'top',
        render: ({ id }) => errorToast(id, 'Verification type not found.'),
      });
      if (router.canGoBack()) router.back();
    }
  }, [toast, typeParams]);

  useEffect(() => {
    toast.closeAll();
    setSecondsLeft(RESEND_OTP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  return (
    <SafeArea className="items-start justify-center p-5">
      <VStack className="bg-background-0 border-outline-100 w-full max-w-md overflow-hidden rounded-2xl border">
        <Box className="relative w-full overflow-hidden" style={{ height: height * 0.15 }}>
          <VerifyImage width={width} height={height * 0.2} style={{ marginLeft: -20 }} />

          <GradientBackground colors={gradientColors} className="opacity-40" />

          <Icon as={Logo} className="absolute left-3 top-3 h-16 w-24" />
        </Box>

        <VStack>
          <VStack space="sm" className="p-5">
            <Text bold size="2xl">
              Verification
            </Text>
            <HStack className="flex-wrap items-center">
              <Text size="md" className="text-typography-700">
                A six digit code has been sent to{' '}
                <Text bold className="text-typography-700">
                  {email}
                </Text>
                .
              </Text>
            </HStack>
          </VStack>
        </VStack>

        <Box className="p-5">
          <OTPForm email={email} type={type} phone={phone} />
        </Box>

        <VStack className="mx-auto items-center p-5">
          <Text size="sm" className="text-typography-600">
            Didn&apos;t receive the verification code?
          </Text>
          <Button
            isDisabled={secondsLeft > 0 || isSending}
            size="sm"
            variant="link"
            onPress={sendOTP}
          >
            <ButtonText className="text-primary-500">
              {secondsLeft > 0
                ? `Send again in ${formatTime(secondsLeft)}`
                : isSending
                  ? 'Sending code...'
                  : 'Send again'}
            </ButtonText>
          </Button>
        </VStack>
      </VStack>

      {router.canGoBack() && (
        <Button variant="link" action="default" size="md" onPress={() => router.back()}>
          <ButtonIcon as={ChevronLeftIcon} />
          <ButtonText>Go back</ButtonText>
        </Button>
      )}
    </SafeArea>
  );
}
