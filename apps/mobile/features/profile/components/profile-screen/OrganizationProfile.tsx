import { AnimatedPressable } from '@/components/animated/pressable';
import MilkBottlePlusIcon from '@/components/icons/MilkBottlePlusIcon';
import { SingleImageViewer } from '@/components/ImageViewer';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { isMeUser } from '@/lib/utils/isMeUser';
import { PopulatedUserProfile } from '@lactalink/types';
import { Individual } from '@lactalink/types/payload-generated-types';
import {
  extractCollection,
  extractImageData,
} from '@lactalink/utilities/extractors';
import { formatNumberToShortenUnits } from '@lactalink/utilities/formatters';
import { Link } from 'expo-router';
import {
  Building2Icon,
  CheckCircle2Icon,
  DropletIcon,
  Edit2Icon,
  HeartIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SquareUserIcon,
} from 'lucide-react-native';
import React from 'react';

interface OrganizationProfileProps {
  profile: Exclude<PopulatedUserProfile, { value: Individual }>;
}

export default function OrganizationProfile({ profile }: OrganizationProfileProps) {
  const { relationTo, value: organization } = profile;
  const owner = extractCollection(organization.owner);
  const isOwner = Boolean(owner && isMeUser(owner));
  const name = organization.displayName || organization.name || 'Organization';
  const typeLabel = relationTo === 'hospitals' ? 'Hospital' : 'Milk Bank';
  const avatar = extractCollection(organization.avatar);
  const avatarImage = avatar ? extractImageData(avatar) : null;
  const address = extractCollection(organization.defaultAddress);
  const addressLabel = address?.displayName || 'No address provided';
  const stockLiters = (organization.totalVolume ?? 0) / 1000;
  const received =
    organization.receivedTransactions?.totalDocs ??
    organization.receivedTransactions?.docs?.length ??
    0;
  const fulfilled =
    organization.sentTransactions?.totalDocs ?? organization.sentTransactions?.docs?.length ?? 0;
  const requestParams = { rid: organization.id, rslg: relationTo };

  const details = [
    relationTo === 'hospitals' && organization.hospitalID
      ? { label: 'Hospital ID', value: organization.hospitalID, icon: Building2Icon }
      : null,
    { label: 'Contact Person', value: organization.head || 'Not provided', icon: SquareUserIcon },
    { label: 'Email', value: owner?.email || 'No email provided', icon: MailIcon },
    { label: 'Phone', value: organization.phone || 'No phone number', icon: PhoneIcon },
    { label: 'Address', value: addressLabel, icon: MapPinIcon },
  ].filter((detail) => detail !== null);

  return (
    <VStack className="items-stretch bg-primary-50">
      <Box className="h-52 overflow-hidden bg-primary-100">
        {avatarImage?.uri ? (
          <Image
            source={{ uri: avatarImage.uri }}
            alt={`${name} cover`}
            className="h-full w-full"
            contentFit="cover"
          />
        ) : (
          <VStack className="h-full items-center justify-center bg-primary-100">
            <Icon as={Building2Icon} size="2xl" className="text-primary-300" />
          </VStack>
        )}
        <Box className="absolute inset-0 bg-primary-100 opacity-20" />
      </Box>

      <VStack className="-mt-5 items-stretch rounded-t-3xl bg-background-50 px-5 pb-6">
        <VStack className="items-center" style={{ marginTop: -58 }}>
          <Box className="h-28 w-28 overflow-hidden rounded-full border-8 border-background-50 bg-primary-50">
            <SingleImageViewer
              image={avatarImage}
              className="h-full w-full rounded-full"
              fallback={
                <Avatar size="xl" className="h-full w-full">
                  <AvatarFallbackText>{name}</AvatarFallbackText>
                </Avatar>
              }
            />
          </Box>

          <Text size="2xl" bold className="mt-2 text-center text-typography-950">
            {name}
          </Text>
          <HStack space="xs" className="mt-1 items-center rounded-full bg-primary-50 px-4 py-2">
            <Icon as={Building2Icon} size="sm" className="text-primary-700" />
            <Text className="font-JakartaMedium text-primary-800">{typeLabel}</Text>
          </HStack>
        </VStack>

        {isOwner && (
          <Box className="absolute right-4 top-4">
            <Link href={`/profile/${relationTo}/${organization.id}/edit`} asChild>
              <AnimatedPressable className="rounded-full bg-background-0 p-3">
                <Icon as={Edit2Icon} className="text-primary-700" />
              </AnimatedPressable>
            </Link>
          </Box>
        )}

        {!isOwner && (
          <Link asChild push href={{ pathname: '/requests/create', params: requestParams }}>
            <Button size="xl" className="mt-4 rounded-2xl">
              <ButtonIcon as={MilkBottlePlusIcon} className="fill-primary-0" />
              <ButtonText size="lg">Request Milk</ButtonText>
            </Button>
          </Link>
        )}

        <Card className="mt-5 rounded-2xl border border-primary-100 bg-background-0 p-4">
          {details.map((detail, index) => (
            <React.Fragment key={detail.label}>
              <HStack space="md" className="items-center py-3">
                <Box className="h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Icon as={detail.icon} className="text-primary-700" />
                </Box>
                <Text className="w-32 text-typography-600">{detail.label}</Text>
                <Text className="min-w-0 flex-1 font-JakartaMedium" numberOfLines={2}>
                  {detail.value}
                </Text>
              </HStack>
              {index < details.length - 1 && <Divider className="ml-14" />}
            </React.Fragment>
          ))}
        </Card>

        <Card className="mt-4 rounded-2xl border border-primary-100 bg-background-0 p-4">
          <HStack className="items-stretch">
            <Stat
              icon={DropletIcon}
              value={formatNumberToShortenUnits(stockLiters, 2)}
              label={'Current Stock\n(Liters)'}
            />
            <Divider orientation="vertical" />
            <Stat icon={HeartIcon} value={received} label={'Received\nDonations'} />
            <Divider orientation="vertical" />
            <Stat icon={CheckCircle2Icon} value={fulfilled} label={'Fulfilled\nRequests'} />
          </HStack>
        </Card>
      </VStack>
    </VStack>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: typeof DropletIcon;
  value: string | number;
  label: string;
}) {
  return (
    <VStack space="xs" className="flex-1 items-center px-2">
      <Box className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
        <Icon as={icon} className="text-primary-600" />
      </Box>
      <Text size="xl" bold>{value}</Text>
      <Text size="xs" className="text-center text-typography-600">{label}</Text>
    </VStack>
  );
}
