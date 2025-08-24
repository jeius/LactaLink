'use client';

import { ApiFetchResponse } from '@lactalink/types';

export async function seedNotificationService() {
  const res = await fetch('/api/seed/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: ApiFetchResponse<void> = await res.json();

  if ('error' in data) {
    throw new Error(data.message, { cause: data.error });
  }

  return { error: false, message: data.message };
}
