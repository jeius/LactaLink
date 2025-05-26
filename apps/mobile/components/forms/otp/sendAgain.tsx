import { Button, ButtonText } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useSession';
import { useAppToast } from '@/hooks/useAppToast';
import { OTP_TOAST_ID, RESEND_OTP } from '@/lib/constants';
import { extractErrorMessage, formatTime } from '@lactalink/utilities';
import React, { useCallback, useEffect, useState } from 'react';
import { OTPFormProps } from './type';

export default function SendAgain({ email, type, phone }: OTPFormProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const { sendVerification, resetPasswordForEmail } = useAuth();

  const toast = useAppToast();

  const sendOTP = useCallback(async () => {
    if (secondsLeft > 0) return;

    setIsSending(true);
    toast.show({
      id: OTP_TOAST_ID,
      type: 'loading',
      message: 'Sending verification code...',
    });

    try {
      if (email) {
        if (type === 'signup' || type === 'email_change') {
          await sendVerification({ email, type });
        } else if (type === 'recovery') {
          await resetPasswordForEmail(email);
        }
      } else if (phone) {
        if (type === 'sms' || type === 'phone_change') {
          await sendVerification({ phone, type });
        }
      }

      setSecondsLeft(RESEND_OTP);

      const recepient = email ? email : phone ? phone : undefined;

      toast.show({
        id: OTP_TOAST_ID,
        type: 'success',
        message: recepient ? `Verification sent to ${recepient}.` : 'Verification sent.',
      });
    } catch (error) {
      toast.show({
        id: OTP_TOAST_ID,
        type: 'error',
        message: extractErrorMessage(error),
      });
    } finally {
      setIsSending(false);
    }
  }, [secondsLeft, toast, email, phone, type, sendVerification, resetPasswordForEmail]);

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
