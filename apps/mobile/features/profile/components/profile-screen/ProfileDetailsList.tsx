import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { PopulatedUserProfile } from '@lactalink/types';
import { extractCollection, extractDefaultAddress } from '@lactalink/utilities/extractors';
import { isHospital, isIndividual } from '@lactalink/utilities/type-guards';
import {
  FileDigitIcon,
  LucideIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SquareUserIcon,
} from 'lucide-react-native';
import React from 'react';

interface ProfileDetailsListProps {
  profile: PopulatedUserProfile;
}

export default function ProfileDetailsList({ profile }: ProfileDetailsListProps) {
  const user = extractCollection(profile.value.owner);

  const orgHead = !isIndividual(profile.value) ? profile.value.head : null;
  const hospitalID = isHospital(profile.value) ? profile.value.hospitalID : null;

  const email = user?.email || 'No email';
  const phone = profile.value.phone || 'No phone number';
  const fullAddress = extractDefaultAddress(user)?.displayName || 'No address';

  const details: ({ label: string; icon: LucideIcon } | null)[] = [
    hospitalID ? { label: 'Hospital ID: ' + hospitalID, icon: FileDigitIcon } : null,
    orgHead ? { label: orgHead, icon: SquareUserIcon } : null,
    { label: email, icon: MailIcon },
    { label: phone, icon: PhoneIcon },
    { label: fullAddress, icon: MapPinIcon },
  ];

  return (
    <VStack space="sm" className="mt-1 items-stretch">
      {details.map(
        (detail, index) =>
          detail && (
            <HStack key={index} space="sm" className="items-center">
              <Icon size="lg" as={detail.icon} className="text-typography-800" />
              <Text size="sm" className="shrink" ellipsizeMode="tail" numberOfLines={1}>
                {detail.label}
              </Text>
            </HStack>
          )
      )}
    </VStack>
  );
}
