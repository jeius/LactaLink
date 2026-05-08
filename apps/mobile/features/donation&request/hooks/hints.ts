import { MMKV_KEYS } from '@/lib/constants/storageKeys';
import Storage from '@/lib/localStorage';
import { useState } from 'react';

const STORAGE_KEY = MMKV_KEYS.ALERT.MILKBAG_VERIFICATION;

export function useMilkBagVerificationHint() {
  const [hasViewedHint, setHasViewed] = useState(!!Storage.getBoolean(STORAGE_KEY));

  function handleHintClose() {
    Storage.set(STORAGE_KEY, true);
    setHasViewed(true);
  }

  return { hasViewedHint, closeHint: handleHintClose };
}
