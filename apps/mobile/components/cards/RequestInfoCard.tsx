import { PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@/lib/constants';

import { Avatar as AvatarType, Image as ImageType, Individual, Request } from '@lactalink/types';
import React from 'react';

import { useAuth } from '@/hooks/auth/useAuth';
import { DonationCreateSearchParams } from '@/lib/types/donationRequest';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { formatDate } from '@lactalink/utilities';
import { useRouter } from 'expo-router';
import { EditIcon, HandHelpingIcon } from 'lucide-react-native';
import Avatar from '../Avatar';
import { ImageViewer } from '../ImageViewer';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { Textarea, TextareaInput } from '../ui/textarea';
import { VStack } from '../ui/vstack';

const urgencyStyle = tva({
  base: 'font-JakartaSemiBold rounded-md px-2 py-0.5 text-white',
  variants: {
    urgency: {
      LOW: 'bg-success-400',
      MEDIUM: 'bg-info-400',
      HIGH: 'bg-warning-400',
      CRITICAL: 'bg-error-400',
    },
  },
});

interface RequestInfoCardProps {
  data: Request;
}

export function RequestInfoCard({ data }: RequestInfoCardProps) {
  const { profile } = useAuth();
  const router = useRouter();

  const {
    details: { neededAt, urgency, storagePreference, image, reason, notes },
    volumeNeeded,
  } = data;

  const requester = data.requester as Individual;
  const requestername = requester.displayName;
  const requesterAvatar = requester.avatar as AvatarType | null | undefined;

  const milkImage = image as ImageType | undefined | null;
  const imageUrl = milkImage?.sizes?.large?.url || milkImage?.url;

  const isOwner = profile && profile.id === requester.id;

  function handleDonatePress() {
    const params: DonationCreateSearchParams = { matchedRequest: data.id };
    if (isOwner) {
      router.push(`/requests/edit/${data.id}`);
    } else {
      router.push({ pathname: '/donations/create', params });
    }
  }

  return (
    <Card className="w-full">
      <VStack space="md">
        {imageUrl && (
          <Box className="h-44 w-full overflow-hidden rounded-lg">
            <ImageViewer imageURIs={[imageUrl]} />
          </Box>
        )}

        <Text className="font-JakartaMedium mt-1">Request Details</Text>

        <Text size="sm">
          Volume needed:{' '}
          <Text size="sm" className="text-primary-500 font-JakartaSemiBold">
            {volumeNeeded} mL
          </Text>
        </Text>

        <Text size="sm">
          Needed at:{' '}
          <Text size="sm" className="text-primary-500 font-JakartaSemiBold">
            {formatDate(neededAt)},{' '}
            {new Date(neededAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Text>

        <HStack space="xs" className="items-center">
          <Text size="sm">Urgency:</Text>
          <Text size="sm" className={urgencyStyle({ urgency })} style={{ borderRadius: 6 }}>
            {URGENCY_LEVELS[urgency].label}
          </Text>
        </HStack>

        {storagePreference && (
          <Text size="sm">
            Preferred storage:{' '}
            <Text size="sm" className="text-primary-500 font-JakartaSemiBold">
              {PREFERRED_STORAGE_TYPES[storagePreference].label}
            </Text>
          </Text>
        )}

        {requestername && (
          <VStack space="xs" className="items-start">
            <Text size="sm">Requested by:</Text>
            <Button size="sm" variant="link" className="h-fit">
              {requesterAvatar && (
                <Avatar size="sm" details={{ avatar: requesterAvatar, name: requestername }} />
              )}
              <ButtonText className="underline">{requestername}</ButtonText>
            </Button>
          </VStack>
        )}

        <VStack space="sm">
          <Text size="sm">Reason:</Text>
          <Textarea size="sm" pointerEvents="none">
            <TextareaInput
              defaultValue={reason || ''}
              placeholder="No reason provided."
              editable={false}
              style={{ textAlignVertical: 'top' }}
            />
          </Textarea>
        </VStack>

        <VStack space="sm">
          <Text size="sm">Notes:</Text>
          <Textarea size="sm" pointerEvents="none">
            <TextareaInput
              defaultValue={notes || ''}
              placeholder="No note provided."
              editable={false}
              style={{ textAlignVertical: 'top' }}
            />
          </Textarea>
        </VStack>

        <Button onPress={handleDonatePress}>
          <ButtonIcon as={isOwner ? EditIcon : HandHelpingIcon} />
          <ButtonText>{isOwner ? 'Edit Request' : 'Donate'}</ButtonText>
        </Button>
      </VStack>
    </Card>
  );
}
