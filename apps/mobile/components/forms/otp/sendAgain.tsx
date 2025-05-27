import { Button, ButtonText } from '@/components/ui/button';
import { useAppToast } from '@/hooks/useAppToast';
import { OTP_TOAST_ID, RESEND_OTP } from '@/lib/constants';
import { VerifyOtpParams } from '@/lib/types';
import { showErrorToastWithId } from '@/lib/utils/showErrorToast';
import { useApiClient } from '@lactalink/api';
import { formatTime } from '@lactalink/utilities';
import React, { useEffect, useState } from 'react';

export default function SendAgain(params: VerifyOtpParams) {
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
      const type = params.type;
      const recipient = 'email' in params ? params.email : params.phone;

      if (type === 'recovery') {
        await apiClient.auth.resetPasswordForEmail(params.email);
      } else if (type === 'signup' || type === 'email_change') {
        await apiClient.auth.sendVerification({ email: params.email, type });
      } else if (type === 'phone_change' || type === 'sms') {
        await apiClient.auth.sendVerification({ phone: params.phone, type });
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
