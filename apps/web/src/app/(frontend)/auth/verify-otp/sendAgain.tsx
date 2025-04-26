'use client';

import { Button } from '@/components/ui/button';
import { RESEND_OTP } from '@/lib/constants';
import { createClient } from '@/lib/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function SendAgain({ email }: { email: string }) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(0);

  const sendOTP = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ email, type: 'signup' });

    if (error) {
      const searchParams = new URLSearchParams();
      searchParams.append('msg', error.message);
      router.push(`/error?${searchParams.toString()}`);
    }

    // Start countdown after sending
    setSecondsLeft(RESEND_OTP);
  }, [email, router]);

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
