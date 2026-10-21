import { HeaderBackButton } from '@/components/HeaderBackButton';
import { ProfileTag } from '@/components/ProfileTag';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ListingBottomCTA, ListingHeaderCTA } from '@/features/donation&request/components/ListingCTA';
import HorizontalDPList from '@/features/donation&request/components/lists/HorizontalDPList';
import HorizontalMilkBagList from '@/features/donation&request/components/lists/HorizontalMilkBagList';
import ProgressTracker from '@/features/donation&request/components/ProgressTracker';
import { CollectionMethodTag, StorageTypeTag } from '@/features/donation&request/components/tags';
import TextAreaBlock from '@/features/donation&request/components/TextAreaBlock';
import { useDonation } from '@/features/donation&request/hooks/queries';
import { useReadState } from '@/features/donation&request/hooks/useReadState';
import { getDonationDetails, isListingExpired } from '@/features/donation&request/lib/utils';
import { Donation } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { HeartIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function MarkAsRead({ donation }: { donation: Donation }) {
  const { isUnread, markAsRead } = useReadState(donation);
  useFocusEffect(useCallback(() => { if (isUnread) markAsRead(); }, [isUnread, markAsRead]));
  return null;
}

export default function DonationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [ctaHeight, setCTAHeight] = useState(0);
  const { data, isLoading, isPlaceholderData } = useDonation(id);
  const { percentage, remainingVolume, ...details } = getDonationDetails(data, true);
  const isExpired = data ? isListingExpired(data) : false;

  return (
    <Box className="flex-1 bg-primary-50" style={{ paddingTop: insets.top }}>
      {data && !isPlaceholderData && <MarkAsRead donation={data} />}

      <HStack className="h-14 items-center justify-between px-4">
        <HeaderBackButton style={{ marginRight: 0 }} />
        <Text size="lg" className="font-JakartaBold text-primary-950">Listing Details</Text>
        <HStack space="sm" className="items-center">
          <Pressable className="h-10 w-10 items-center justify-center rounded-full">
            <Icon as={HeartIcon} className="text-primary-500" />
          </Pressable>
          {data ? <ListingHeaderCTA variant="ghost" data={data} /> : <Box className="h-10 w-10" />}
        </HStack>
      </HStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: ctaHeight + insets.bottom + 24, gap: 12 }}
      >
        <Box className="overflow-hidden rounded-2xl border border-primary-100 bg-primary-100 px-4 py-5">
          <Box className="absolute inset-0 bg-primary-50 opacity-50" />
          {isLoading || !data ? (
            <Skeleton className="h-14 rounded-xl" />
          ) : (
            <ProfileTag label="Donor" profile={{ relationTo: 'individuals', value: data.donor }} />
          )}
        </Box>

        <VStack space="lg" className="rounded-2xl border border-outline-100 bg-background-0 p-4">
          <VStack space="xs">
            <Text size="sm" className="text-typography-600">Available Quantity</Text>
            {isLoading ? (
              <Skeleton className="h-9 w-36 rounded-lg" />
            ) : (
              <HStack space="md" className="items-center">
                <Text size="3xl" className="font-JakartaExtraBold text-primary-950">{displayVolume(remainingVolume)}</Text>
                <Box className={`rounded-full px-3 py-1 ${isExpired ? 'bg-error-50' : 'bg-success-50'}`}>
                  <Text size="xs" className={isExpired ? 'text-error-700' : 'text-success-700'}>
                    ● {isExpired ? 'Expired' : 'Available'}
                  </Text>
                </Box>
              </HStack>
            )}
          </VStack>
          <ProgressTracker isLoading={isLoading} percentage={percentage} label={`${displayVolume(remainingVolume)} / ${displayVolume(details.volume)}`} />
          <HStack space="md" className="flex-wrap items-center border-t border-outline-100 pt-3">
            <StorageTypeTag isLoading={isLoading} data={data} />
            <CollectionMethodTag isLoading={isLoading} data={data} />
          </HStack>
        </VStack>

        <Box className="rounded-2xl border border-outline-100 bg-background-0 p-4">
          <TextAreaBlock isLoading={isLoading} title="Notes" content={details.notes} placeholder="No notes provided" />
        </Box>

        <Box className="overflow-hidden rounded-2xl border border-outline-100 bg-background-0 py-4">
          <HorizontalMilkBagList
            isLoading={isLoading}
            data={extractCollection(details.bags) || []}
            labelClassName="text-primary-950"
          />
        </Box>

        <Box className="overflow-hidden rounded-2xl border border-outline-100 bg-background-0 py-4">
          <HorizontalDPList
            isLoading={isLoading}
            data={extractCollection(data?.deliveryPreferences) || []}
            labelClassName="text-primary-950"
          />
        </Box>
      </ScrollView>

      {data && <ListingBottomCTA data={data} onLayout={({ nativeEvent }) => setCTAHeight(nativeEvent.layout.height)} />}
    </Box>
  );
}
