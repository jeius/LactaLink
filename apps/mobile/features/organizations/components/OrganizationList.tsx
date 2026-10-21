import { AnimatedPressable } from '@/components/animated/pressable';
import {
  useHideOnScrollAnimation,
  useScrollAnimationMethods,
} from '@/components/contexts/ScrollProvider';
import { NoData } from '@/components/NoData';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { InfiniteFlashList } from '@/components/ui/list';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { addProfileToAllCache } from '@/features/profile/lib/cacheUtils';
import { useCurrentCoordinates } from '@/lib/stores';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { Hospital, MilkBank } from '@lactalink/types/payload-generated-types';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import {
  extractCollection,
  extractImageData,
  listKeyExtractor,
} from '@lactalink/utilities/extractors';
import { formatCamelCase } from '@lactalink/utilities/formatters';
import { convertDistance, getDistance } from '@lactalink/utilities/geolib';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import {
  Building2Icon,
  CheckCircle2Icon,
  ChevronRightIcon,
  MapPinIcon,
  SearchIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useInfiniteNearestOrganizations } from '../hooks/queries';

interface OrganizationListProps {
  collection: Extract<CollectionSlug, 'hospitals' | 'milkBanks'>;
}

type Filter = 'all' | 'nearby' | 'inStock' | 'outOfStock';

export function OrganizationList({ collection }: OrganizationListProps) {
  const { scrollValue, scrollDirection: _, ...scrollHandlers } = useScrollAnimationMethods();
  const headerAnimatedStyle = useHideOnScrollAnimation(scrollValue, {
    animationDirection: 'up',
    animateDistance: 116,
  });
  const coordinates = useCurrentCoordinates();
  const [filter, setFilter] = useState<Filter>('all');
  const [inputVal, setInputVal] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSetSearch = useMemo(() => debounce(setSearch, 250, { trailing: true }), []);

  const {
    data: organizations,
    isRefetching,
    refetch,
    ...query
  } = useInfiniteNearestOrganizations(collection, {
    search,
    callback: (doc, queryClient) => {
      addProfileToAllCache(queryClient, { relationTo: collection, value: doc });
    },
  });

  const filteredOrganizations = useMemo(() => {
    if (query.isPlaceholderData) return organizations;
    return organizations.filter((organization) => {
      const volume = organization.totalVolume ?? 0;
      if (filter === 'inStock') return volume > 0;
      if (filter === 'outOfStock') return volume <= 0;
      if (filter === 'nearby') return isNearby(organization, coordinates);
      return true;
    });
  }, [coordinates, filter, organizations, query.isPlaceholderData]);

  return (
    <Box className="flex-1 bg-background-50">
      <InfiniteFlashList
        {...query}
        {...scrollHandlers}
        data={filteredOrganizations}
        keyExtractor={listKeyExtractor}
        contentContainerClassName="px-4 pb-5"
        contentContainerStyle={{ paddingTop: 132 }}
        refreshing={isRefetching}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <Box className="h-3" />}
        ListEmptyComponent={
          <NoData
            title={
              filter === 'nearby' && !coordinates
                ? 'Enable location to find nearby organizations'
                : `No ${formatCamelCase(collection)} found`
            }
          />
        }
        renderItem={({ item }) => {
          if (isPlaceHolderData(item)) return <Skeleton className="h-32 rounded-2xl" />;
          return <OrganizationCard item={item} relationTo={collection} />;
        }}
      />

      <Animated.View
        style={[headerAnimatedStyle]}
        className="absolute inset-x-0 top-0 border-b border-outline-100 bg-background-0 px-4 pb-3 pt-3"
      >
        <Input variant="rounded" size="md" className="bg-background-0">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            value={inputVal}
            onChangeText={(text) => {
              setInputVal(text);
              debouncedSetSearch(text.trim());
            }}
            placeholder={`Search ${formatCamelCase(collection)}...`}
          />
          {inputVal &&
            (query.isFetching ? (
              <Spinner size="small" className="mr-3" />
            ) : (
              <InputSlot
                className="mr-3"
                onPress={() => {
                  setInputVal('');
                  debouncedSetSearch('');
                }}
              >
                <InputIcon as={XIcon} />
              </InputSlot>
            ))}
        </Input>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 pt-3"
        >
          <FilterChip active={filter === 'all'} label="All" onPress={() => setFilter('all')} />
          <FilterChip
            active={filter === 'nearby'}
            label="Nearby"
            icon={MapPinIcon}
            onPress={() => setFilter('nearby')}
          />
          <FilterChip
            active={filter === 'inStock'}
            label="In Stock"
            icon={CheckCircle2Icon}
            onPress={() => setFilter('inStock')}
          />
          <FilterChip
            active={filter === 'outOfStock'}
            label="Out of Stock"
            icon={XCircleIcon}
            onPress={() => setFilter('outOfStock')}
          />
        </ScrollView>
      </Animated.View>
    </Box>
  );
}

function FilterChip({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon?: typeof MapPinIcon;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${
        active ? 'border-primary-500 bg-primary-500' : 'border-primary-100 bg-primary-50'
      }`}
    >
      <HStack space="xs" className="items-center">
        {icon && <Icon as={icon} size="sm" className={active ? 'text-primary-0' : 'text-primary-600'} />}
        <Text size="sm" className={active ? 'font-JakartaSemiBold text-primary-0' : 'text-primary-800'}>
          {label}
        </Text>
      </HStack>
    </Pressable>
  );
}

function OrganizationCard({
  item,
  relationTo,
}: {
  item: Hospital | MilkBank;
  relationTo: Extract<CollectionSlug, 'hospitals' | 'milkBanks'>;
}) {
  const router = useRouter();
  const avatar = extractCollection(item.avatar);
  const image = avatar ? extractImageData(avatar) : null;
  const address = extractCollection(item.defaultAddress);
  const addressLabel = getAddressLabel(address);
  const volume = item.totalVolume ?? 0;
  const stock = getStockStatus(volume);
  const typeLabel = relationTo === 'hospitals' ? 'Hospital' : 'Milk Bank';

  const handlePress = () => router.push(`/profile/${relationTo}/${item.id}`);

  return (
    <AnimatedPressable
      onPress={handlePress}
      className="overflow-hidden rounded-2xl border border-outline-100 bg-background-0 p-4"
    >
      <HStack space="md" className="items-center">
        <Box className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-primary-50">
          {image?.uri ? (
            <Image source={{ uri: image.uri }} alt={item.name} className="h-full w-full" />
          ) : (
            <Icon as={Building2Icon} size="2xl" className="text-primary-500" />
          )}
        </Box>

        <VStack space="xs" className="min-w-0 flex-1">
          <Text bold numberOfLines={1} className="text-typography-900">
            {item.name}
          </Text>
          <HStack space="xs" className="items-center">
            <Icon as={MapPinIcon} size="xs" className="text-typography-600" />
            <Text size="xs" numberOfLines={1} className="flex-1 text-typography-600">
              {addressLabel}
            </Text>
          </HStack>
          <HStack space="xs">
            <Box className="rounded-full bg-primary-50 px-3 py-1">
              <Text size="xs" className="text-primary-700">{typeLabel}</Text>
            </Box>
            {item.type && (
              <Box className="rounded-full bg-secondary-50 px-3 py-1">
                <Text size="xs" className="text-secondary-700">{formatCamelCase(item.type)}</Text>
              </Box>
            )}
          </HStack>
        </VStack>

        <VStack space="xs" className="items-end">
          <Box className={`rounded-full px-3 py-2 ${stock.className}`}>
            <Text size="xs" className={`font-JakartaSemiBold ${stock.textClassName}`}>
              ● {stock.label}
            </Text>
          </Box>
          <Text size="2xs" className="text-typography-500">
            {formatUpdatedAt(item.updatedAt)}
          </Text>
          <Button size="sm" className="rounded-xl px-4" onPress={handlePress}>
            <ButtonText>View</ButtonText>
            <ButtonIcon as={ChevronRightIcon} />
          </Button>
        </VStack>
      </HStack>
    </AnimatedPressable>
  );
}

function getStockStatus(volume: number) {
  if (volume <= 0) {
    return { label: 'Out of Stock', className: 'bg-error-50', textClassName: 'text-error-700' };
  }
  if (volume < 1000) {
    return { label: 'Low Stock', className: 'bg-warning-50', textClassName: 'text-warning-700' };
  }
  return { label: 'In Stock', className: 'bg-success-50', textClassName: 'text-success-700' };
}

function getAddressLabel(address: ReturnType<typeof extractCollection>) {
  if (!address || typeof address !== 'object') return 'Address not provided';
  if ('displayName' in address && address.displayName) return String(address.displayName);
  const city = 'cityMunicipality' in address ? extractCollection(address.cityMunicipality) : null;
  const province = 'province' in address ? extractCollection(address.province) : null;
  const cityName = city && typeof city === 'object' && 'name' in city ? city.name : null;
  const provinceName = province && typeof province === 'object' && 'name' in province ? province.name : null;
  return [cityName, provinceName].filter(Boolean).join(', ') || 'Address not provided';
}

function isNearby(
  organization: Hospital | MilkBank,
  coordinates: ReturnType<typeof useCurrentCoordinates>
) {
  if (!coordinates) return false;
  const address = extractCollection(organization.defaultAddress);
  if (!address?.coordinates) return false;
  const [lng, lat] = address.coordinates;
  const meters = getDistance(
    { lat: coordinates.latitude, lng: coordinates.longitude },
    { lat, lng }
  );
  return convertDistance(meters, 'km') <= 50;
}

function formatUpdatedAt(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${Math.floor(hours / 24)}d ago`;
}
