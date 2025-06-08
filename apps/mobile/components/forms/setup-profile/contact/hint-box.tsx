import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { MMKV_KEYS } from '@/lib/constants';
import { setupProfileStorage as storage } from '@/lib/localStorage';
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
        <Box className="absolute right-0 top-0">
          <Button variant="link" action="default" onPress={handleAlertClose}>
            <ButtonIcon
              as={XIcon}
              size="sm"
              className="text-info-900 data-[active=true]:text-info-700"
            />
          </Button>
        </Box>
      </Alert>
    )
  );
}
