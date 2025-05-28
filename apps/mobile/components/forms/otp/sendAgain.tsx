import { Button, ButtonText } from '@/components/ui/button';
import { useAppToast } from '@/hooks/useAppToast';
import { OTP_TOAST_ID, RESEND_OTP } from '@/lib/constants';
import { showErrorToastWithId } from '@/lib/utils/showErrorToast';
import { useApiClient } from '@lactalink/api';
import { VerifyOtp } from '@lactalink/types';
import { formatTime, isResend } from '@lactalink/utilities';
import React, { useEffect, useState } from 'react';

export default function SendAgain(params: VerifyOtp) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const toast = useAppToast();
  const apiClient = useApiClient();

  const sendOTP = async () => {
    if (secondsLeft > 0) return;
    setIsSending(true);

    toast.closeAll();
    toast.show({
      id: OTP_TOAST_ID,
      type: 'loading',
      message: 'Sending verification code...',
    });

    try {
      const recipient = 'email' in params ? params.email : params.phone;

      if (isResend(params)) {
        await apiClient.auth.sendVerification(params);
      } else {
        await apiClient.auth.resetPasswordForEmail(params.email);
      }

      toast.show({
        id: OTP_TOAST_ID,
        type: 'success',
        message: `Verification sent to ${recipient}.`,
      });
    } catch (error) {
      showErrorToastWithId(error, OTP_TOAST_ID);
    }
    setIsSending(false);
  };

  useEffect(() => {
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
