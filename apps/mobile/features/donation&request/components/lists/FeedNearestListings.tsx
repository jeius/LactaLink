import { AnimatedPressable } from '@/components/animated/pressable';
import { ProfileAvatar } from '@/components/Avatar';
import { DonateRequestModal } from '@/components/modals';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { FlashList } from '@/components/ui/FlashList';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFetchNearest } from '@/hooks/collections/useFetchNearest';
import { getColor } from '@/lib/colors';
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
import { ChevronRightCircleIcon, ImageIcon, PackagePlusIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { sortToNearestListings } from '../../lib/utils';

const PLACEHOLDER = generatePlaceHoldersWithID(20, {} as Donation | Request);

export default function FeedNearestListings({ isLoading: isLoadingProp }: { isLoading?: boolean }) {
  const donationsQuery = useFetchNearest('donations', { limit: 6 });
  const requestsQuery = useFetchNearest('requests', { limit: 6 });

  const isLoading = isLoadingProp || donationsQuery.isLoading || requestsQuery.isLoading;

  const { donations, requests } = useMemo(() => {
    const donations = donationsQuery.data?.pages.flatMap((p) => p?.docs ?? []) ?? [];
    const requests = requestsQuery.data?.pages.flatMap((p) => p?.docs ?? []) ?? [];
    return { donations, requests };
  }, [donationsQuery.data?.pages, requestsQuery.data?.pages]);

  const listings = useMemo(() => {
    const combined = [...donations, ...requests];
    return isLoading ? PLACEHOLDER : sortToNearestListings(combined);
  }, [donations, isLoading, requests]);

  const isEmpty = listings.length === 0;

  return (
    <FlashList
      data={listings}
      keyExtractor={listKeyExtractor}
      horizontal
      style={shadow.sm}
      className="border border-outline-200"
      contentContainerClassName="grow p-3 bg-background-0"
      footerClassName="ml-2"
      ItemSeparatorComponent={() => <Box className="w-2" />}
      ListFooterComponent={!isEmpty ? <CTA /> : null}
      ListEmptyComponent={<ListEmpty />}
      renderItem={({ item }) => {
        const isPlaceholder = isPlaceHolderData(item);
        if (isPlaceholder) return <PlaceholderCard />;

        const slug = isDonation(item) ? 'donations' : 'requests';
        const id = item.id;
        return (
          <Link asChild push href={`/${slug}/${id}`}>
            <AnimatedPressable className="overflow-hidden rounded-2xl" style={shadow.sm}>
              <ItemCard item={item} />
            </AnimatedPressable>
          </Link>
        );
      }}
    />
  );
}

//#region Subcomponents
function ItemCard({ item }: { item: Donation | Request }) {
  const isDonationItem = isDonation(item);
  const volume = isDonationItem ? item.remainingVolume : item.volumeNeeded;
  const title = isDonationItem ? 'Donation' : 'Request';
  const volumeText = displayVolume(volume);
  const profile = isDonationItem ? item.donor : item.requester;

  const image = extractCollection(isDonationItem ? item.details.milkSample : item.details.image);
  const imageData = image && extractOneImageData(image);
  const imageUri = imageData?.uri;
  const imageAlt = `${title} image`;

  const bgColor = isDonationItem ? getColor('primary', '600') : getColor('tertiary', '600');
  const ringColor = isDonationItem ? getColor('primary', '500') : getColor('tertiary', '500');
  const textColor = isDonationItem ? getColor('primary', '0') : getColor('tertiary', '0');

  return (
    <VStack className="h-44 w-32 justify-between bg-background-300">
      <Box className="absolute inset-0">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            alt={imageAlt}
            placeholder={{ blurhash: imageData.blurHash }}
            className="h-full w-full"
            recyclingKey={`${title}-${imageUri}`}
          />
        ) : (
          <VStack space="xs" className="flex-1 items-center justify-center">
            <Icon as={ImageIcon} size="2xl" className="text-typography-800" />
            <Text size="xs" className="text-typography-700">
              No Image
            </Text>
          </VStack>
        )}

        <Box className="absolute inset-0" style={{ backgroundColor: bgColor, opacity: 0.1 }} />
      </Box>

      <Box
        className="self-start rounded-full border-2"
        style={{ borderColor: ringColor, padding: 1, margin: 6 }}
      >
        <ProfileAvatar size="xs" profile={{ relationTo: 'individuals', value: profile }} />
      </Box>

      <Box className="px-2 py-1">
        <Box className="absolute inset-0" style={{ opacity: 0.6, backgroundColor: ringColor }} />

        <Text size="xs" style={{ color: textColor }} className="font-JakartaMedium">
          {title}
        </Text>

        <Text bold style={{ color: textColor }}>
          {volumeText}
        </Text>
      </Box>
    </VStack>
  );
}

function CTA() {
  return (
    <Link asChild push href={'/listings'}>
      <Pressable className="h-44 w-32 flex-1 items-center justify-center overflow-hidden rounded-2xl">
        <Icon as={ChevronRightCircleIcon} size="2xl" />
        <Text size="sm" className="mt-2 font-JakartaSemiBold">
          See More
        </Text>
      </Pressable>
    </Link>
  );
}

function ListEmpty() {
  return (
    <VStack space="lg" className="h-44 flex-1 items-center justify-center">
      <Text className="font-JakartaMedium text-typography-600">No nearby listings!</Text>
      <DonateRequestModal
        trigger={(props) => (
          <Button disablePressAnimation size="md" action="primary" variant="ghost" {...props}>
            <ButtonIcon as={PackagePlusIcon} />
            <ButtonText>Create One</ButtonText>
          </Button>
        )}
      />
    </VStack>
  );
}

function PlaceholderCard() {
  return <Skeleton variant="rounded" className="h-44 w-32 rounded-2xl" />;
}
//#endregion
