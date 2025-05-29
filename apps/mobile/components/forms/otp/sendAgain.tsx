import { sendOtp } from '@/auth';
import { Button, ButtonText } from '@/components/ui/button';
import { RESEND_OTP } from '@/lib/constants';
import { VerifyOtp } from '@lactalink/types';
import { extractErrorMessage, formatTime } from '@lactalink/utilities';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner-native';

export default function SendAgain(params: VerifyOtp) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    setIsSending(true);

    const sendOtpPromise = sendOtp(params);

    toast.promise(sendOtpPromise, {
      loading: 'Sending verification code...',
      success: (msg) => {
        setSecondsLeft(RESEND_OTP);
        return msg;
      },
      error: (error) => {
        setSecondsLeft(0);
        return extractErrorMessage(error);
      },
    });

    await sendOtpPromise;
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
    <Button
      isDisabled={secondsLeft > 0 || isSending}
      size="sm"
      variant="link"
      onPress={handleResend}
    >
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
