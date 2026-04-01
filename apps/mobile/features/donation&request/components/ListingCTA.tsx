import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonProps, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { MilkBottlePlus2Icon } from '@/components/ui/icon/custom';
import { useMeUser } from '@/hooks/auth/useAuth';
import { shadow } from '@/lib/utils/shadows';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { useRouter } from 'expo-router';
import {
  CheckCircle,
  EditIcon,
  EllipsisVerticalIcon,
  HandHeartIcon,
  LucideProps,
} from 'lucide-react-native';
import React, { FC } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DonationCreateParams, RequestCreateParams } from '../lib/types';
import { isEditableListing, isResolvableListing } from '../lib/utils';
import ChatButton from './ChatButton';
import ListingOwnerActionSheet from './ListingOwnerActionsheet';

interface CTAProps {
  data: Donation | Request;
  onLayout?: (event: LayoutChangeEvent) => void;
  variant?: ButtonProps['variant'];
}

export function ListingHeaderCTA({ data, variant = 'solid' }: CTAProps) {
  const { data: meUser } = useMeUser();

  const profile = data && isDonation(data) ? data?.donor : data?.requester;
  const profileOwner = extractCollection(profile)?.owner;

  const isOwner = profile ? extractID(meUser) === extractID(profileOwner) : false;

  return (
    <HStack space="md" className="items-center justify-end">
      {!isOwner
        ? profileOwner && <ChatButton recipient={profileOwner} variant={variant} />
        : data && (
            <ListingOwnerActionSheet
              doc={data}
              trigger={
                <Button
                  variant={variant}
                  action="muted"
                  className="h-fit w-fit rounded-full p-3"
                  style={variant === 'solid' ? shadow.sm : undefined}
                >
                  <ButtonIcon as={EllipsisVerticalIcon} />
                </Button>
              }
            />
          )}
    </HStack>
  );
}

export function ListingBottomCTA({ data, onLayout }: CTAProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: meUser } = useMeUser();

  const profile = isDonation(data) ? data?.donor : data?.requester;
  const isOwner = isEqualProfiles({ relationTo: 'individuals', value: profile }, meUser?.profile);

  const isStatusPending = data.status === DONATION_REQUEST_STATUS.PENDING.value;

  let label: string;
  let icon: FC<LucideProps> | null = null;

  if (isEditableListing(data, meUser)) {
    label = isDonation(data) ? 'Edit Donation' : 'Edit Request';
    icon = EditIcon;
  } else if (isResolvableListing(data, meUser)) {
    label = isDonation(data) ? 'Accept Donation' : 'Approve and Donate';
    icon = CheckCircle;
  } else {
    label = isDonation(data) ? 'Make a Request' : 'Make a Donation';
    icon = isDonation(data) ? MilkBottlePlus2Icon : HandHeartIcon;
  }

  const handlePress = () => {
    if (isRequest(data)) {
      if (isOwner) {
        router.push(`/requests/${data.id}/edit`);
      } else {
        const params: DonationCreateParams = { mrid: data.id };
        router.push({ pathname: '/donations/create', params });
      }
    } else {
      if (isOwner) {
        router.push(`/donations/${data.id}/edit`);
      } else {
        const params: RequestCreateParams = { mdid: data.id };
        router.push({ pathname: '/requests/create', params });
      }
    }
  };

  return (
    <Box
      onLayout={onLayout}
      className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-outline-300 bg-background-0 p-4"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <Button onPress={handlePress} action={isStatusPending ? 'info' : 'primary'}>
        {icon && <ButtonIcon as={icon} />}
        <ButtonText>{label}</ButtonText>
      </Button>
    </Box>
  );
}
