'use client';

import { Button } from '@/components/ui/button';
import { RESEND_OTP } from '@/lib/constants';
import { createClient } from '@/lib/utils/supabase/client';
import { formatTime } from '@lactalink/utilities/formatters';
import { AuthError, VerifyOtpParams } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  email?: string;
  phone?: string;
  type: VerifyOtpParams['type'];
}

export default function SendAgain({ email, type, phone }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();

  const sendOTP = useCallback(async () => {
    if (secondsLeft > 0) return;

    setIsSending(true);

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
        toast(error.message);
        return;
      }

      toast(`Verification sent to your ${email ? 'email' : 'inbox'}.`);
      setSecondsLeft(RESEND_OTP);
    } finally {
      setIsSending(false);
    }
  }, [secondsLeft, email, phone, type, supabase]);

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
