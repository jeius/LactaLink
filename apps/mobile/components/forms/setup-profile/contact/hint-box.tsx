import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Button, ButtonIcon } from '@/components/ui/button';
import { MMKV_KEYS } from '@/lib/constants';
import storage from '@/lib/localStorage';
import { AlertCircleIcon, XIcon } from 'lucide-react-native';
import React, { useState } from 'react';

const storageKey = MMKV_KEYS.ALERT.ADDRESS.CREATE;

export function HintBox() {
  const isHintViewed = storage.getBoolean(storageKey);
  const [showHint, setShowHint] = useState(Boolean(!isHintViewed));

  function handleAlertClose() {
    storage.set(storageKey, true);
    setShowHint(false);
  }

  return (
    showHint && (
      <Alert variant="solid" action="info" className="relative">
        <AlertIcon as={AlertCircleIcon} size="md" />
        <AlertText>You can save multiple addresses.</AlertText>
        <Button
          variant="link"
          action="default"
          onPress={handleAlertClose}
          className="absolute right-0 top-0"
        >
          <ButtonIcon
            as={XIcon}
            size="sm"
            className="text-info-900 data-[active=true]:text-info-700"
          />
        </Button>
      </Alert>
    )
  );
}
