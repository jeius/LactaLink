import { useTheme } from '@/components/providers/theme-provider';
import { Button, ButtonText } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { RESEND_OTP } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { errorToast, loadingToast, successToast } from '@/lib/toaster';
import { formatTime } from '@lactalink/utilities';
import { AuthError, VerifyOtpParams } from '@supabase/supabase-js';
import React, { useCallback, useEffect, useState } from 'react';

interface Props {
  email?: string;
  phone?: string;
  type: VerifyOtpParams['type'];
}

export default function SendAgain({ email, type, phone }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const toast = useToast();
  const { theme } = useTheme();

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
    <Button isDisabled={secondsLeft > 0 || isSending} size="sm" variant="link" onPress={sendOTP}>
      <ButtonText className="text-primary-500">
        {secondsLeft > 0
          ? `Send again in ${formatTime(secondsLeft)}`
          : isSending
            ? 'Sending code...'
            : 'Send again'}
      </ButtonText>
    </Button>
  );
}
