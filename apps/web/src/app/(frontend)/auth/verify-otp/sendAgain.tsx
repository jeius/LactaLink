'use client';

import { FormBannerProps } from '@/components/forms/FormBanner';
import { Button } from '@/components/ui/button';
import { useGlobalState } from '@/hooks/useGlobalState';
import { QUERY_KEYS, RESEND_OTP } from '@/lib/constants';
import { createClient } from '@/lib/utils/supabase/client';
import { OTPType } from '@lactalink/types/auth';
import { useCallback, useEffect, useState } from 'react';

const queryKey = QUERY_KEYS.VERIFY_OTP.MESSAGE;

interface Props {
  email: string;
  type: OTPType;
}

export default function SendAgain({ email, type }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [_, setMessage] = useGlobalState<FormBannerProps['message']>(queryKey, null);
  const [isSending, setIsSending] = useState(false);

  const sendOTP = useCallback(async () => {
    if (secondsLeft > 0) return;

    setIsSending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ email, type });

    if (error) {
      setMessage(error.message);
    }

    // Start countdown after sending
    setSecondsLeft(RESEND_OTP);
    setIsSending(false);
  }, [email, setMessage, type, secondsLeft]);

  useEffect(() => {
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

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
