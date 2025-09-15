'use client';

import { sendOtp } from '@/auth/actions';
import { Button } from '@/components/ui/button';
import { RESEND_OTP } from '@/lib/constants';
import { VerifyOtp } from '@lactalink/types/auth';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { formatTime } from '@lactalink/utilities/formatters';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SendAgain(params: VerifyOtp) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const sendOTP = async () => {
    if (secondsLeft > 0) return;
    setIsSending(true);

    try {
      await toast
        .promise(() => sendOtp(params), {
          loading: 'Sending verification code...',
          success: (recepient) => `Verification sent to ${recepient}.`,
          error: (error) => extractErrorMessage(error),
        })
        .unwrap();

      setSecondsLeft(RESEND_OTP);
    } catch (error) {
      console.error('Error sending OTP:', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    setSecondsLeft(RESEND_OTP);
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
      variant="link"
      className="text-primary hover:text-primary-600 hover:cursor-pointer hover:no-underline"
      size="sm"
      onClick={sendOTP}
      disabled={secondsLeft > 0 || isSending}
    >
      {secondsLeft > 0
        ? `Send again in ${formatTime(secondsLeft)}`
        : isSending
          ? 'Sending code...'
          : 'Send again'}
    </Button>
  );
}
