'use client';

import { FormBannerProps } from '@/components/FormBanner';
import { Button } from '@/components/ui/button';
import { useGlobalState } from '@/hooks/useGlobalState';
import { QUERY_KEYS, RESEND_OTP } from '@/lib/constants';
import { createClient } from '@/lib/utils/supabase/client';
import { useCallback, useEffect, useState } from 'react';

const queryKey = QUERY_KEYS.VERIFY_OTP.MESSAGE;

export default function SendAgain({ email }: { email: string }) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [_, setMessage] = useGlobalState<FormBannerProps['message']>(queryKey, null);

  const sendOTP = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ email, type: 'signup' });

    if (error) {
      setMessage(error.message);
    }

    // Start countdown after sending
    setSecondsLeft(RESEND_OTP);
  }, [email, setMessage]);

  useEffect(() => {
    sendOTP();
  }, [sendOTP]);

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
      disabled={secondsLeft > 0}
    >
      {secondsLeft > 0 ? `Send again in ${formatTime(secondsLeft)}` : 'Send again'}
    </Button>
  );
}
