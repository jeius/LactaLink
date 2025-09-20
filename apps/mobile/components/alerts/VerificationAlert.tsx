import { MMKV_KEYS } from '@/lib/constants';
import localStorage from '@/lib/localStorage';
import { Link } from 'expo-router';
import { BadgeCheckIcon, XIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';

const WAIT_FOR_DAYS = 7;
const ALERT_KEY = MMKV_KEYS.ALERT.VERIFICATION;

function willShow() {
  const dismissedAt = localStorage.getString(ALERT_KEY);

  if (!dismissedAt) return true;

  const dismissedDate = new Date(dismissedAt);
  const now = new Date();
  const diffInMs = now.getTime() - dismissedDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays >= WAIT_FOR_DAYS;
}

export function VerificationAlert() {
  const [show, setShow] = useState(willShow());

  function handleClose() {
    localStorage.set(ALERT_KEY, new Date().toISOString());
    setShow(false);
  }

  return (
    show && (
      <Card variant="filled" className="bg-info-50 border-info-50 flex-col items-stretch gap-2">
        <HStack space="sm" className="items-center justify-between">
          <Text className="font-JakartaMedium flex-1" ellipsizeMode="tail" numberOfLines={2}>
            You are not verified yet.
          </Text>
          <Button
            variant="link"
            action="default"
            className="h-fit w-fit p-0"
            hitSlop={8}
            onPress={handleClose}
          >
            <ButtonIcon as={XIcon} />
          </Button>
        </HStack>

        <Text size="sm" className="text-typography-800">
          Verified users enjoy more trust and credibility within the community.
        </Text>

        <Link asChild push href="verify-identity">
          <Button size="sm" variant="solid" action="info" className="mt-1 self-start rounded-full">
            <ButtonIcon as={BadgeCheckIcon} />
            <ButtonText>Verify Now</ButtonText>
          </Button>
        </Link>
      </Card>
    )
  );
}
