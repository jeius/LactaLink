import { Button, ButtonIcon, ButtonProps, ButtonText } from '@/components/ui/button';
import { HStack, HStackProps } from '@/components/ui/hstack';
import { HandBottleIcon, MilkBottlePlus2Icon } from '@/components/ui/icon/custom';
import { useMeUser } from '@/hooks/auth/useAuth';
import { DonationCreateParams, RequestCreateParams } from '@/lib/types/donationRequest';
import { UserProfile } from '@lactalink/types';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractID } from '@lactalink/utilities/extractors';
import { toKebabCase } from '@lactalink/utilities/formatters';
import { Href, useRouter } from 'expo-router';
import { ClipboardListIcon, EditIcon, LucideIcon } from 'lucide-react-native';
import React, { FC, useMemo } from 'react';
import { SvgProps } from 'react-native-svg';
import { DataMarker } from '../../lib/types';

const DONATE_BTN_ICON = HandBottleIcon;
const REQUEST_BTN_ICON = MilkBottlePlus2Icon;

export default function CallToAction({ data, space = 'sm', ...props }: DataMarker & HStackProps) {
  const router = useRouter();
  const { data: meUser } = useMeUser();

  const docID = extractID(data.value);
  const docSlug = data.relationTo;
  const isOrganization = docSlug === 'hospitals' || docSlug === 'milkBanks';

  const { isOwner, mainBtnIcon, mainBtnLabel, buttonAction } = useMemo(() => {
    const profileInvolved = getInvolvedProfile(data);
    const isOwner = isEqualProfiles(meUser?.profile, profileInvolved);

    let mainBtnIcon: LucideIcon | FC<SvgProps> = EditIcon;
    let mainBtnLabel: string = 'Edit';
    let buttonAction: ButtonProps['action'] = 'default';

    if (!isOwner) {
      switch (data.relationTo) {
        case 'donations':
          mainBtnIcon = REQUEST_BTN_ICON;
          mainBtnLabel = 'Request';
          buttonAction = 'tertiary';
          break;
        case 'requests':
          mainBtnIcon = DONATE_BTN_ICON;
          mainBtnLabel = 'Donate';
          buttonAction = 'primary';
          break;
      }
    }

    return { isOwner, mainBtnIcon, mainBtnLabel, profileInvolved, buttonAction };
  }, [data, meUser]);

  function handleRequestPress() {
    if (isOwner) {
      router.push(`/requests/${docID}/edit`);
    } else {
      const params: DonationCreateParams = { mrid: docID };
      router.push({ pathname: '/donations/create', params });
    }
  }

  function handleDonatePress() {
    if (isOwner) {
      router.push(`/donations/${docID}/edit`);
    } else {
      const params: RequestCreateParams = { mdid: docID };
      router.push({ pathname: '/requests/create', params });
    }
  }

  function handleMainBtnPress() {
    switch (docSlug) {
      case 'donations':
        handleDonatePress();
        break;
      case 'requests':
        handleRequestPress();
        break;
    }
  }

  function handleViewDetailsPress() {
    let href: Href = `/${toKebabCase(docSlug)}/${docID}` as Href;
    if (isOrganization) {
      href = `/profile/${docSlug}/${docID}`;
    }
    router.push(href);
  }

  return (
    <HStack {...props} space={space}>
      {!isOrganization ? (
        <Button
          size="lg"
          action={buttonAction}
          className="flex-1 rounded-full shadow"
          onPress={handleMainBtnPress}
        >
          <ButtonIcon as={mainBtnIcon} className="h-6 w-6" />
          <ButtonText>{mainBtnLabel}</ButtonText>
        </Button>
      ) : (
        <>
          <Button
            size="lg"
            action="primary"
            className="flex-1 rounded-full shadow"
            onPress={handleDonatePress}
          >
            <ButtonIcon as={DONATE_BTN_ICON} className="h-6 w-6" />
            <ButtonText>Donate</ButtonText>
          </Button>

          <Button
            size="lg"
            action="tertiary"
            className="flex-1 rounded-full shadow"
            onPress={handleDonatePress}
          >
            <ButtonIcon as={REQUEST_BTN_ICON} className="h-6 w-6" />
            <ButtonText>Request</ButtonText>
          </Button>
        </>
      )}

      <Button
        size="lg"
        action="muted"
        className="rounded-full bg-background-0 shadow"
        onPress={handleViewDetailsPress}
      >
        <ButtonIcon as={ClipboardListIcon} className="h-6 w-6" />
        {!isOrganization && <ButtonText>Details</ButtonText>}
      </Button>
    </HStack>
  );
}

function getInvolvedProfile(data: DataMarker['data']): UserProfile {
  switch (data.relationTo) {
    case 'donations':
      return { value: (data.value as Donation).donor, relationTo: 'individuals' };
    case 'requests':
      return { value: (data.value as Request).requester, relationTo: 'individuals' };
    default:
      return data as UserProfile;
  }
}
