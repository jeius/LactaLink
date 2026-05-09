import { Button, ButtonIcon, ButtonProps, ButtonText } from '@/components/ui/button';
import { HStack, HStackProps } from '@/components/ui/hstack';
import { BabyBottlePlusIcon, HandBabyBottleIcon } from '@/components/ui/icon/custom';
import {
  DonationCreateParams,
  RecipientSearchParams,
  RequestCreateParams,
} from '@/features/donation&request/lib/types';
import { useMeUser } from '@/hooks/auth/useAuth';
import { UserProfile } from '@lactalink/types';
import { Collection } from '@lactalink/types/collections';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractID } from '@lactalink/utilities/extractors';
import { Href, useRouter } from 'expo-router';
import { BuildingIcon, ClipboardListIcon, EditIcon, LucideIcon } from 'lucide-react-native';
import { FC } from 'react';
import { SvgProps } from 'react-native-svg';
import { DataMarkerSlug } from '../../lib/types';

const DONATE_BTN_ICON = HandBabyBottleIcon;
const REQUEST_BTN_ICON = BabyBottlePlusIcon;

interface CallToActionProps extends HStackProps {
  isLoading?: boolean;
  data?: {
    relationTo: DataMarkerSlug;
    value: Collection<DataMarkerSlug>;
  } | null;
}

/** Config for the single action button shown on listing markers. */
interface ListingButtonConfig {
  label: string;
  icon: LucideIcon | FC<SvgProps>;
  action: ButtonProps['action'];
}

const LISTING_BUTTON_CONFIG = {
  owner: { label: 'Edit', icon: EditIcon, action: 'default' as const },
  donations: { label: 'Request', icon: REQUEST_BTN_ICON, action: 'tertiary' as const },
  requests: { label: 'Donate', icon: DONATE_BTN_ICON, action: 'primary' as const },
} satisfies Record<string, ListingButtonConfig>;

export default function CallToAction({
  data,
  space = 'sm',
  isLoading,
  ...props
}: CallToActionProps) {
  const router = useRouter();
  const { data: meUser } = useMeUser();

  const docID = extractID(data?.value);
  const docSlug = data?.relationTo;
  const isOrganization = docSlug === 'hospitals' || docSlug === 'milkBanks';
  const isOwner = isEqualProfiles(meUser?.profile, getInvolvedProfile(data));

  // --- Handlers for organization markers ---

  function handleOrgDonate() {
    if (isOwner || !docSlug || !docID) {
      router.push(`/profile/${docSlug}/${docID}`);
    } else if (!isOwner && (docSlug === 'hospitals' || docSlug === 'milkBanks')) {
      router.push({
        pathname: '/donations/create',
        params: { rid: docID, rslg: docSlug } satisfies RecipientSearchParams,
      });
    }
  }

  function handleOrgRequest() {
    if (isOwner || !docSlug || !docID) {
      router.push(`/profile/${docSlug}/${docID}`);
    } else if (!isOwner && (docSlug === 'hospitals' || docSlug === 'milkBanks')) {
      router.push({
        pathname: '/requests/create',
        params: { rid: docID, rslg: docSlug } satisfies RecipientSearchParams,
      });
    }
  }

  // --- Handler for listing (donation / request) markers ---

  function handleListingAction() {
    if (!docSlug || !docID) return;

    if (isOwner) {
      router.push(`/${docSlug}/${docID}/edit` as Href);
      return;
    }

    if (docSlug === 'donations') {
      // Non-owner viewing a donation listing → create a request matched to it
      router.push({
        pathname: '/requests/create',
        params: { mdid: docID } satisfies RequestCreateParams,
      });
    } else if (docSlug === 'requests') {
      // Non-owner viewing a request listing → create a donation matched to it
      router.push({
        pathname: '/donations/create',
        params: { mrid: docID } satisfies DonationCreateParams,
      });
    }
  }

  // --- Handler for the view-details / view-profile icon button ---

  function handleViewPress() {
    if (!docSlug || !docID) return;
    if (isOrganization) {
      router.push(`/profile/${docSlug}/${docID}`);
    } else {
      router.push(`/${docSlug}/${docID}` as Href);
    }
  }

  if (isLoading) return null;

  const listingBtnConfig = isOwner
    ? LISTING_BUTTON_CONFIG.owner
    : (LISTING_BUTTON_CONFIG[docSlug as 'donations' | 'requests'] ?? LISTING_BUTTON_CONFIG.owner);

  return (
    <HStack {...props} space={space}>
      {isOrganization ? (
        isOwner ? (
          <Button variant="outline" size="lg" action="default" onPress={handleViewPress}>
            <ButtonIcon as={BuildingIcon} />
            <ButtonText>View</ButtonText>
          </Button>
        ) : (
          <>
            <Button size="lg" action="primary" className="flex-1 shadow" onPress={handleOrgDonate}>
              <ButtonIcon as={DONATE_BTN_ICON} className="h-6 w-6 stroke-primary-0" />
              <ButtonText>Donate</ButtonText>
            </Button>

            <Button
              size="lg"
              action="tertiary"
              className="flex-1 shadow"
              onPress={handleOrgRequest}
            >
              <ButtonIcon as={REQUEST_BTN_ICON} className="h-6 w-6 stroke-tertiary-0" />
              <ButtonText>Request</ButtonText>
            </Button>
          </>
        )
      ) : (
        <Button
          size="lg"
          action={listingBtnConfig.action}
          className="flex-1 shadow"
          onPress={handleListingAction}
        >
          <ButtonIcon as={listingBtnConfig.icon} className="h-6 w-6 stroke-typography-0" />
          <ButtonText>{listingBtnConfig.label}</ButtonText>
        </Button>
      )}

      {(!isOrganization || !isOwner) && (
        <Button
          size="lg"
          action="muted"
          className="h-fit w-fit rounded-full bg-background-0 p-3 shadow"
          onPress={handleViewPress}
        >
          <ButtonIcon as={ClipboardListIcon} className="h-6 w-6" />
        </Button>
      )}
    </HStack>
  );
}

function getInvolvedProfile(data: CallToActionProps['data']): UserProfile | null {
  if (!data) return null;
  switch (data.relationTo) {
    case 'donations':
      return { value: (data.value as Donation).donor, relationTo: 'individuals' };
    case 'requests':
      return { value: (data.value as Request).requester, relationTo: 'individuals' };
    default:
      return data as UserProfile;
  }
}
