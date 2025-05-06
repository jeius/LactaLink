import Logo from '@/assets/svgs/logo.svg';
import VerifyImage from '@/assets/svgs/verification.svg';
import OTPForm from '@/components/forms/otp';
import { useTheme } from '@/components/providers/theme-provider';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { getRgbColor } from '@/lib/colors';
import { RESEND_OTP } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { errorToast, loadingToast, successToast } from '@/lib/toaster';
import { OTPType } from '@lactalink/types';
import { formatTime } from '@lactalink/utilities';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeftIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyOTP() {
  const { width, height } = Dimensions.get('window');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const toast = useToast();
  const { theme } = useTheme();
  const { email, type } = useLocalSearchParams();

  const formattedEmail = Array.isArray(email) ? email[0] : email;
  const formattedType = (Array.isArray(type) ? type[0] : type) as OTPType;

  const gradientColors = [
    'transparent',
    (getRgbColor(theme, 'primary', 200) as string) || 'transparent',
  ] as const;

  const sendOTP = useCallback(async () => {
    if (secondsLeft > 0) return;

    setIsSending(true);
    toast.show({
      id: 'otp',
      placement: 'top',
      duration: null,
      render: ({ id }) => loadingToast(id, 'Sending verification code...', theme),
    });

    const { error } = await supabase.auth.resend({ email: formattedEmail, type: formattedType });

    if (error) {
      toast.show({
        id: 'otp',
        placement: 'top',
        render: ({ id }) => errorToast(id, error.message),
      });
    }

    toast.show({
      id: 'otp',
      placement: 'top',
      render: ({ id }) => successToast(id, 'Verification sent.', 'Please check your email.'),
    });

    // Start countdown after sending
    setSecondsLeft(RESEND_OTP);
    setIsSending(false);
  }, [formattedEmail, formattedType, secondsLeft, theme, toast]);

  useEffect(() => {
    if (!email) {
      toast.show({
        id: 'otp',
        duration: 3000,
        placement: 'top',
        render: ({ id }) => errorToast(id, 'Recepient email not found.'),
      });
      router.back();
    }
    if (!type) {
      toast.show({
        id: 'otp',
        duration: 3000,
        placement: 'top',
        render: ({ id }) => errorToast(id, 'Verification type not found.'),
      });
      router.back();
    }
  }, [email, toast, type]);

  useEffect(() => {
    toast.closeAll();
    sendOTP();
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
    <SafeAreaView className="bg-background-100 relative flex flex-1 flex-col items-end justify-center p-5">
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
              <Text size="md" className="text-typography-400">
                A six digit code has been sent to <Text bold>{formattedEmail}</Text>.
              </Text>
            </HStack>
          </VStack>
        </VStack>

        <Box className="p-5">
          <OTPForm email={formattedEmail} type={formattedType} />
        </Box>

        <VStack className="mx-auto items-center p-5">
          <Text size="sm">Didn&apos;t receive the verification code?</Text>
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
        <Button variant="link" size="md" onPress={() => router.back()}>
          <ButtonIcon as={ChevronLeftIcon} />
          <ButtonText>Back to sign in</ButtonText>
        </Button>
      )}
    </SafeAreaView>
  );
}
