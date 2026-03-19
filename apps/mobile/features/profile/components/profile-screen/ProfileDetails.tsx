import TruncatedText from '@/components/TruncatedText';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { PopulatedUserProfile } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities/extractors';
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

interface Props {
  profile: PopulatedUserProfile;
}

export default function ProfileDetails({ profile }: Props) {
  const user = extractCollection(profile.value.owner);

  const orgHead = !isIndividual(profile.value) ? profile.value.head : null;
  const hospitalID = isHospital(profile.value) ? profile.value.hospitalID : null;

  const email = user?.email || 'No email';
  const phone = profile.value.phone || 'No phone number';
  const fullAddress = extractCollection(profile.value.defaultAddress)?.displayName || 'No address';

  const details: { label: string; icon: LucideIcon }[] = [
    hospitalID ? { label: 'Hospital ID: ' + hospitalID, icon: FileDigitIcon } : null,
    orgHead ? { label: orgHead, icon: SquareUserIcon } : null,
    { label: email, icon: MailIcon },
    { label: phone, icon: PhoneIcon },
    { label: fullAddress, icon: MapPinIcon },
  ].filter((v) => v !== null);

  return (
    <VStack space="md" className="mt-1">
      {details.map((detail, index) => (
        <HStack key={index} space="sm">
          <Icon size="lg" as={detail.icon} />
          <TruncatedText size="sm" containerClassName="flex-1" hitSlop={6} initialLines={1}>
            {detail.label}
          </TruncatedText>
        </HStack>
      ))}
    </VStack>
  );
}
