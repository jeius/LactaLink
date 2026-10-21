import { useHeaderSize } from '@/components/contexts/HeaderProvider';
import { DrawerHeader } from '@/components/drawer/DrawerHeader';
import { SingleImageViewer } from '@/components/ImageViewer';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useNearestDonations } from '@/features/donation&request/hooks/useNearestListings';
import { useCurrentCoordinates } from '@/lib/stores';
import { getMinDistance } from '@/lib/utils/getMinDistance';
import { STORAGE_TYPES } from '@lactalink/enums';
import { Donation } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { CalendarDaysIcon, ChevronDownIcon, ChevronRightIcon, HeartIcon, ListIcon, MapPinIcon, MilkIcon, PackageIcon, SearchIcon, SlidersHorizontalIcon, SnowflakeIcon } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList } from 'react-native';

type ListingFilter = 'all' | 'fresh' | 'frozen' | 'nearby';

export default function ListingsScreen() {
  const router = useRouter();
  const coordinates = useCurrentCoordinates();
  const { height: headerHeight } = useHeaderSize();
  const [filter, setFilter] = useState<ListingFilter>('all');
  const [search, setSearch] = useState('');
  const { data, isPlaceholderData, isRefetching, refetch, fetchNextPage, hasNextPage } = useNearestDonations();

  const listings = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((item) => {
      if (isPlaceholderData) return true;
      if (filter === 'fresh' && item.details.storageType !== 'FRESH') return false;
      if (filter === 'frozen' && item.details.storageType !== 'FROZEN') return false;
      if (filter === 'nearby') {
        const distance = getListingDistance(item, coordinates);
        if (distance === undefined || distance > 25) return false;
      }
      if (!term) return true;
      const donor = extractCollection(item.donor);
      return [item.title, item.volume, donor?.displayName, getListingAddress(item)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [coordinates, data, filter, isPlaceholderData, search]);

  return (
    <SafeArea safeTop={false} className="items-stretch bg-background-50">
      <DrawerHeader title="Available Listings" hideShadow />
      <Box className="w-0" style={{ height: headerHeight }} />
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
        refreshing={isRefetching}
        onRefresh={refetch}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <VStack space="lg" className="mb-2">
            <HStack space="sm" className="items-center">
              <Input variant="rounded" size="lg" className="flex-1 bg-background-0">
                <InputSlot className="pl-4"><InputIcon as={SearchIcon} /></InputSlot>
                <InputField value={search} onChangeText={setSearch} placeholder="Search by milk type, volume, location..." />
              </Input>
              <Pressable className="h-12 w-12 items-center justify-center rounded-xl">
                <Icon as={SlidersHorizontalIcon} className="text-primary-500" />
              </Pressable>
            </HStack>
            <HStack space="sm" className="items-center">
              <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
              <FilterChip label="Refrigerated" icon={SnowflakeIcon} active={filter === 'fresh'} onPress={() => setFilter('fresh')} />
              <FilterChip label="Frozen" icon={PackageIcon} active={filter === 'frozen'} onPress={() => setFilter('frozen')} />
              <FilterChip label="Near Me" icon={MapPinIcon} active={filter === 'nearby'} onPress={() => setFilter('nearby')} />
            </HStack>
            <HStack className="items-center justify-between py-2">
              <HStack space="xs" className="items-center">
                <Text className="text-typography-600">Sort by:</Text>
                <Text className="font-JakartaSemiBold text-primary-900">Latest</Text>
                <Icon as={ChevronDownIcon} size="sm" className="text-primary-800" />
              </HStack>
              <Box className="rounded-xl bg-primary-500 p-3"><Icon as={ListIcon} className="text-primary-0" /></Box>
            </HStack>
          </VStack>
        }
        ListEmptyComponent={
          <VStack className="items-center py-16">
            <Icon as={MilkIcon} size="2xl" className="text-primary-300" />
            <Text className="mt-3 text-typography-600">No available listings found.</Text>
          </VStack>
        }
        renderItem={({ item }) => isPlaceholderData ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : (
          <ListingCard item={item} distance={getListingDistance(item, coordinates)} onPress={() => router.push(`/donations/${item.id}`)} />
        )}
      />
    </SafeArea>
  );
}

function FilterChip({ label, icon, active, onPress }: { label: string; icon?: typeof MapPinIcon; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`min-w-24 flex-1 rounded-xl border px-3 py-3 ${active ? 'border-primary-500 bg-primary-500' : 'border-primary-100 bg-background-0'}`}>
      <HStack space="xs" className="items-center justify-center">
        {icon && <Icon as={icon} size="sm" className={active ? 'text-primary-0' : 'text-primary-500'} />}
        <Text size="sm" numberOfLines={1} className={active ? 'font-JakartaSemiBold text-primary-0' : 'text-primary-900'}>{label}</Text>
      </HStack>
    </Pressable>
  );
}

function ListingCard({ item, distance, onPress }: { item: Donation; distance?: number; onPress: () => void }) {
  const donor = extractCollection(item.donor);
  const image = extractOneImageData(extractCollection(item.details.milkSample), 'lg');
  const storageLabel = item.details.storageType === 'FRESH' ? 'Refrigerated' : STORAGE_TYPES[item.details.storageType].label;
  return (
    <Pressable onPress={onPress} className="overflow-hidden rounded-2xl border border-outline-100 bg-background-0 p-3">
      <HStack space="md" className="items-stretch">
        <Box className="h-32 w-32 overflow-hidden rounded-xl bg-primary-50"><SingleImageViewer image={image} disabled className="flex-1" /></Box>
        <VStack className="min-w-0 flex-1 justify-between py-1">
          <HStack className="items-start justify-between">
            <VStack className="min-w-0 flex-1">
              <Text size="2xl" className="font-JakartaExtraBold text-primary-950">{displayVolume(item.remainingVolume || item.volume)}</Text>
              <HStack space="sm" className="mt-2 flex-wrap items-center">
                <Box className="rounded-full bg-primary-50 px-3 py-1">
                  <HStack space="xs" className="items-center"><Icon as={item.details.storageType === 'FROZEN' ? PackageIcon : SnowflakeIcon} size="xs" className="text-primary-500" /><Text size="xs" className="text-primary-700">{storageLabel}</Text></HStack>
                </Box>
                <Box className="rounded-full bg-success-50 px-3 py-1"><Text size="xs" className="text-success-700">Available</Text></Box>
              </HStack>
            </VStack>
            <Icon as={HeartIcon} className="text-primary-400" />
          </HStack>
          <HStack space="lg" className="items-end justify-between">
            <VStack space="xs" className="min-w-0 flex-1">
              <HStack space="xs" className="items-center"><Icon as={CalendarDaysIcon} size="xs" className="text-primary-700" /><Text size="xs" className="text-typography-600">Collected {formatDate(getCollectedAt(item))}</Text></HStack>
              <HStack space="xs" className="items-center"><Icon as={MapPinIcon} size="xs" className="text-primary-500" /><Text size="xs" numberOfLines={1} className="flex-1 text-typography-600">{distance !== undefined ? `${distance.toFixed(1)} km · ` : ''}{getListingAddress(item)}</Text></HStack>
              <Text size="sm" numberOfLines={1} className="font-JakartaSemiBold text-primary-950">{donor?.displayName || item.title}</Text>
            </VStack>
            <Icon as={ChevronRightIcon} className="text-primary-800" />
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
}

function getCollectedAt(item: Donation) {
  const bag = extractCollection(item.details.bags)?.[0];
  return bag?.collectedAt || item.createdAt;
}

function getListingAddress(item: Donation) {
  const preference = extractCollection(item.deliveryPreferences)?.[0];
  const address = preference ? extractCollection(preference.address) : null;
  return address?.displayName || address?.geocodedAddress || 'Location not specified';
}

function getListingDistance(item: Donation, coordinates: ReturnType<typeof useCurrentCoordinates>) {
  return getMinDistance(extractCollection(item.deliveryPreferences), coordinates) ?? undefined;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value));
}
