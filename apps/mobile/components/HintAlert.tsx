import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { MMKV_KEYS } from '@/lib/constants';
import { setupProfileStorage as storage } from '@/lib/localStorage';
import { AlertCircleIcon, LucideIcon, LucideProps, XIcon } from 'lucide-react-native';
import React, { FC, useState } from 'react';

const storageKey = MMKV_KEYS.ALERT.ADDRESS.CREATE;

interface HintAlertProps {
  onClose?: () => void;
  message: string;
  icon?: LucideIcon | FC<LucideProps>;
}

export function HintAlert({ onClose, message, icon = AlertCircleIcon }: HintAlertProps) {
  const isHintViewed = storage.getBoolean(storageKey);
  const [showHint, setShowHint] = useState(Boolean(!isHintViewed));

  function handleAlertClose() {
    storage.set(storageKey, true);
    setShowHint(false);
    onClose?.();
  }

  return (
    showHint && (
      <Alert variant="solid" action="info" className="relative">
        <AlertIcon as={icon} size="md" />
        <VStack>
          <AlertText>{message}</AlertText>
        </VStack>
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
