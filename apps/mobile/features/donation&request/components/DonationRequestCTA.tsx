import { Button, ButtonIcon, ButtonProps, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon, ThreeDotsIcon } from '@/components/ui/icon';
import { Popover, PopoverBackdrop, PopoverContent } from '@/components/ui/popover';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { useMeUser } from '@/hooks/auth/useAuth';
import { DonationCreateParams, RequestCreateParams } from '@/lib/types/donationRequest';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { useRouter } from 'expo-router';
import {
  CheckCircle,
  EditIcon,
  HandHeartIcon,
  LucideProps,
  MessageCircleIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react-native';
import React, { FC } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '../../../components/ui/box';
import { MilkBottlePlus2Icon } from '../../../components/ui/icon/custom';

interface DonationRequestCTAProps {
  data?: Donation | Request;
  isLoading?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  variant?: ButtonProps['variant'];
}
export function DonationRequestCTA({
  data,
  isLoading,
  variant = 'solid',
}: DonationRequestCTAProps) {
  const { data: meUser } = useMeUser();
  const meUserProfile = extractCollection(meUser?.profile?.value);

  const profile = extractCollection(data && isDonation(data) ? data?.donor : data?.requester);
  const isOwner = meUserProfile?.id === profile?.id;
  const status = data?.status;

  const isEditable =
    status &&
    (
      [DONATION_REQUEST_STATUS.PENDING.value, DONATION_REQUEST_STATUS.AVAILABLE.value] as string[]
    ).includes(status);

  const isDeletable =
    status &&
    (
      [DONATION_REQUEST_STATUS.EXPIRED.value, DONATION_REQUEST_STATUS.CANCELLED.value] as string[]
    ).includes(status);

  return isLoading ? null : (
    <HStack space="md" className="items-center justify-end">
      <Button action="muted" variant={variant} className="h-fit w-fit rounded-full p-3">
        <ButtonIcon as={MessageCircleIcon} />
      </Button>

      {isOwner && (isEditable || isDeletable) && (
        <Popover
          placement="top left"
          offset={8}
          useRNModal
          shouldOverlapWithTrigger
          trigger={(props) => (
            <Button
              {...props}
              variant={variant}
              action="muted"
              className="h-fit w-fit rounded-full p-3"
            >
              <ButtonIcon as={ThreeDotsIcon} />
            </Button>
          )}
        >
          <PopoverBackdrop />
          <PopoverContent className="flex-col p-2">
            {isEditable && (
              <Pressable className="flex-row items-center overflow-hidden rounded-md p-2">
                <Icon as={EditIcon} size="sm" className="mr-2" />
                <Text size="sm">Edit</Text>
              </Pressable>
            )}
            {isDeletable && (
              <Pressable className="flex-row items-center overflow-hidden rounded-md p-2">
                <Icon as={Trash2Icon} size="sm" className="mr-2 text-error-500" />
                <Text size="sm" className="text-error-500">
                  Delete
                </Text>
              </Pressable>
            )}

            {isEditable && (
              <Pressable className="flex-row items-center overflow-hidden rounded-md p-2">
                <Icon as={XCircleIcon} size="sm" className="mr-2 text-error-500" />
                <Text size="sm" className="text-error-500">
                  Cancel
                </Text>
              </Pressable>
            )}
          </PopoverContent>
        </Popover>
      )}
    </HStack>
  );
}

export function DonationRequestBottomCTA({ data, isLoading, onLayout }: DonationRequestCTAProps) {
  const router = useRouter();
  const { data: meUser } = useMeUser();
  const insets = useSafeAreaInsets();

  if (!data) return null;

  const meUserProfile = extractCollection(meUser?.profile?.value);

  const profile = extractCollection(data && isDonation(data) ? data?.donor : data?.requester);
  const isOwner = meUserProfile?.id === profile?.id;

  const isPending = data?.status === DONATION_REQUEST_STATUS.PENDING.value;

  let label: string;
  let icon: FC<LucideProps> | null = null;

  if (isRequest(data)) {
    if (isOwner) {
      label = 'Edit Request';
      icon = EditIcon;
    } else if (isPending) {
      label = 'Approve and Donate';
      icon = CheckCircle;
    } else {
      label = 'Make a Donation';
      icon = HandHeartIcon;
    }
  } else {
    if (isOwner) {
      label = 'Edit Donation';
      icon = EditIcon;
    } else if (isPending) {
      label = 'Accept Donation';
      icon = CheckCircle;
    } else {
      label = 'Make a Request';
      icon = MilkBottlePlus2Icon;
    }
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

  return isLoading ? null : (
    <Box
      onLayout={onLayout}
      className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-outline-300 bg-background-0 p-4"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <Button onPress={handlePress} action={isPending ? 'info' : 'primary'}>
        {icon && <ButtonIcon as={icon} />}
        <ButtonText>{label}</ButtonText>
      </Button>
    </Box>
  );
}
