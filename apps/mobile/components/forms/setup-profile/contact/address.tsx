import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { MMKV_KEYS } from '@/lib/constants';
import storage from '@/lib/localStorage';
import { SetupProfileSchema } from '@lactalink/types';
import { AlertCircleIcon, XIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

const storageKey = MMKV_KEYS.ALERT.ADDRESS.CREATE;

export default function AddressForm({ form }: { form: UseFormReturn<SetupProfileSchema> }) {
  const { getValues } = form;

  const addresses = getValues('addresses');
  return (
    <VStack space="md">
      <Text size="lg" className="font-JakartaMedium">
        Addresses
      </Text>
      <Hint />
      <Card></Card>
    </VStack>
  );
}

function Hint() {
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
