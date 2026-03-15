import { AnimatedPressable } from '@/components/animated/pressable';
import { ProfileAvatar } from '@/components/Avatar';
import { SingleImageViewer } from '@/components/ImageViewer';
import { DonateRequestModal } from '@/components/modals';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FlashList } from '@/components/ui/FlashList';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useFetchNearest } from '@/hooks/collections/useFetchNearest';
import { getColor } from '@/lib/colors';
import { getMinDistance } from '@/lib/utils/getMinDistance';
import { shadow } from '@/lib/utils/shadows';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { displayVolume, generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import {
  extractCollection,
  extractOneImageData,
  listKeyExtractor,
} from '@lactalink/utilities/extractors';
import { isDonation } from '@lactalink/utilities/type-guards';
import { Link } from 'expo-router';
import { ChevronRightCircleIcon, PackagePlusIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';

const PLACEHOLDER = generatePlaceHoldersWithID(20, {} as Donation | Request);

export function NearestListingsList({ isLoading: isLoadingProp }: { isLoading?: boolean }) {
  const donationsQuery = useFetchNearest('donations', { limit: 10 });
  const requestsQuery = useFetchNearest('requests', { limit: 10 });

  const isLoading = isLoadingProp || donationsQuery.isLoading || requestsQuery.isLoading;

  const { donations, requests } = useMemo(() => {
    const donations = donationsQuery.data?.pages.flatMap((p) => p?.docs ?? []) ?? [];
    const requests = requestsQuery.data?.pages.flatMap((p) => p?.docs ?? []) ?? [];
    return { donations, requests };
  }, [donationsQuery.data?.pages, requestsQuery.data?.pages]);

  const listings = useMemo(() => {
    const combined = [...donations, ...requests];
    return isLoading ? PLACEHOLDER : sortToNearest(combined);
  }, [donations, isLoading, requests]);

  const isEmpty = listings.length === 0;

  return (
    <FlashList
      data={listings}
      keyExtractor={listKeyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="border border-outline-200"
      style={shadow.sm}
      contentContainerClassName="grow p-4 bg-background-0"
      ItemSeparatorComponent={() => <Box className="w-2" />}
      ListFooterComponent={!isEmpty ? <CTA /> : null}
      ListEmptyComponent={<ListEmpty />}
      ListFooterComponentStyle={{ marginLeft: 8 }}
      renderItem={({ item }) => {
        const isPlaceholder = isPlaceHolderData(item);
        if (isPlaceholder) return <PlaceholderItem />;

        const slug = isDonation(item) ? 'donations' : 'requests';
        const id = item.id;
        return (
          <Link asChild push href={`/${slug}/${id}`}>
            <AnimatedPressable className="overflow-hidden rounded-2xl">
              <ItemCard item={item} />
            </AnimatedPressable>
          </Link>
        );
      }}
    />
  );
}

function ItemCard({ item }: { item: Donation | Request }) {
  const donationData = isDonation(item);
  const volume = donationData ? item.remainingVolume : item.volumeNeeded;
  const title = donationData ? 'Donation' : 'Request';
  const profile = donationData ? item.donor : item.requester;
  const image = extractCollection(donationData ? item.details.milkSample : item.details.image);
  const imageData = image && extractOneImageData(image);
  const bgColor = donationData ? getColor('primary', '500') : getColor('tertiary', '500');
  const textColor = donationData ? getColor('primary', '0') : getColor('tertiary', '50');

  return (
    <Card variant="elevated" className="h-44 w-32 flex-col items-stretch justify-between p-0">
      <Box className="absolute inset-0">
        <SingleImageViewer image={imageData} disabled />
      </Box>

      <Box className="self-start p-2">
        <Box className="rounded-full border-2" style={{ borderColor: bgColor, padding: 1 }}>
          <ProfileAvatar size="xs" profile={{ relationTo: 'individuals', value: profile }} />
        </Box>
      </Box>

      <Box className="flex-col px-2 py-1">
        <Box className="absolute inset-0" style={{ backgroundColor: bgColor, opacity: 0.75 }} />
        <Text size="xs" style={{ color: textColor }} className="font-JakartaMedium">
          {title}
        </Text>
        <Text size="sm" bold style={{ color: textColor }}>
          {displayVolume(volume)}
        </Text>
      </Box>
    </Card>
  );
}

function CTA() {
  return (
    <Link asChild push href={'/listings'}>
      <AnimatedPressable className="overflow-hidden rounded-2xl">
        <Card variant="filled" className="h-44 w-32 items-center justify-center border-0">
          <Icon as={ChevronRightCircleIcon} size="2xl" />
          <Text size="sm" className="mt-2 font-JakartaSemiBold">
            See More
          </Text>
        </Card>
      </AnimatedPressable>
    </Link>
  );
}

function ListEmpty() {
  return (
    <HStack space="lg" className="h-44 flex-1 items-center justify-center">
      <Text className="font-JakartaMedium text-typography-600">No nearby listings!</Text>
      <DonateRequestModal
        trigger={(props) => (
          <Button size="md" action="primary" variant="outline" {...props}>
            <ButtonIcon as={PackagePlusIcon} />
            <ButtonText>Create One</ButtonText>
          </Button>
        )}
      />
    </HStack>
  );
}

function PlaceholderItem() {
  return <Skeleton variant="rounded" className="h-44 w-32 rounded-2xl" />;
}

function sortToNearest(items: (Donation | Request)[]) {
  return items.sort((a, b) => {
    const dpA = extractCollection(a.deliveryPreferences);
    const dpB = extractCollection(b.deliveryPreferences);
    const distanceA = getMinDistance(dpA) ?? 0;
    const distanceB = getMinDistance(dpB) ?? 0;
    return distanceA - distanceB;
  });
}
