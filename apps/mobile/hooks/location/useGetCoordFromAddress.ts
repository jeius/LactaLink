import { ANDROID_MAPS_API_KEY, IOS_MAPS_API_KEY } from '@/lib/constants';
import { useGoogleAutocomplete } from '@appandflow/react-native-google-autocomplete';
import { getApiClient } from '@lactalink/api';
import {
  AddressSchema,
  Barangay,
  CityMunicipality,
  CollectionSlug,
  Province,
} from '@lactalink/types';
import { useQuery } from '@tanstack/react-query';
import { Coordinates } from 'expo-maps';
import { Platform } from 'react-native';

export function useGetCoordFromAddress(address: AddressSchema) {
  const defaultAddress = address.zipCode?.trim() || 'Philippines';

  const API_KEY =
    Platform.OS === 'ios'
      ? IOS_MAPS_API_KEY
      : Platform.OS === 'android'
        ? ANDROID_MAPS_API_KEY
        : ANDROID_MAPS_API_KEY;

  const { locationResults, setTerm, searchDetails, searchError, isSearching } =
    useGoogleAutocomplete(API_KEY, {
      language: 'en',
      debounce: 300,
      queryTypes: 'address',
      components: 'country:ph',
    });

  const {
    data: fullAddress,
    isLoading: isLoadingAddress,
    isFetching: isFetchingAddress,
    error: getAddressError,
  } = useQuery({
    enabled: Boolean(address),
    queryKey: ['get-coordinates', JSON.stringify(address)],
    queryFn: async () => {
      const fullAddress = (await fetchAddressData(address)) || defaultAddress;
      setTerm(fullAddress);
      return fullAddress;
    },
  });

  const {
    data: coordinates,
    isLoading: isLoadingCoord,
    isFetching: isFetchingCoord,
    error: getCoordError,
  } = useQuery<Coordinates>({
    queryKey: ['get-coordinates', JSON.stringify({ locationResults })],
    queryFn: async () => {
      if (!locationResults || locationResults.length === 0) {
        throw new Error('No location results found');
      }
      console.log('Location results:', locationResults);
      const placeId = locationResults[0]!.place_id;
      const { lat, lng } = (await searchDetails(placeId)).geometry.location;
      return { latitude: lat, longitude: lng };
    },
  });

  console.log('Full address:', fullAddress);
  console.log('Searching...', isSearching);

  const error = getAddressError || searchError || getCoordError;
  const isLoading = isLoadingAddress || isLoadingCoord || isSearching;
  const isFetching = isFetchingAddress || isFetchingCoord;

  return { coordinates, fullAddress, isLoading, error, isFetching };
}

type Slugs = Extract<CollectionSlug, 'barangays' | 'citiesMunicipalities' | 'provinces'>;

async function fetchAddressData({
  cityMunicipality,
  province,
  barangay,
}: Partial<AddressSchema>): Promise<string | null> {
  const apiClient = getApiClient();

  const dataToFetch: { id?: string | null; slug: Slugs }[] = [
    // Must be in this order to avoid unnecessary API calls
    { id: barangay, slug: 'barangays' },
    { id: cityMunicipality, slug: 'citiesMunicipalities' },
    { id: province, slug: 'provinces' },
  ];

  let data: Barangay | CityMunicipality | Province | null = null;

  for (const { id, slug: collection } of dataToFetch) {
    if (id) {
      data = await apiClient.findByID({ id, collection: collection, depth: 3 });
      break;
    }
  }

  if (!data) {
    throw new Error('No address data found');
  }

  if (data) {
    if ('cityMunicipality' in data) {
      const brgyName = data.name;
      const cityName = (data.cityMunicipality as CityMunicipality | null)?.name;
      const provinceName = (data.province as Province | null)?.name;

      return formatAddress({
        barangay: brgyName,
        cityMunicipality: cityName,
        province: provinceName,
      });
    } else if ('province' in data) {
      const cityName = data.name;
      const provinceName = (data.province as Province | null)?.name;

      return formatAddress({ cityMunicipality: cityName, province: provinceName });
    } else if ('region' in data) {
      const provinceName = data.name;

      return formatAddress({ province: provinceName });
    }
  }

  return null;
}

function formatAddress({
  barangay,
  cityMunicipality,
  province,
}: {
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
}): string {
  const parts: string[] = [];

  if (barangay) {
    parts.push(barangay);
  }
  if (cityMunicipality) {
    const formattedCityMunicipality = cityMunicipality.split(' of ').reverse().join(' ').trim();
    parts.push(formattedCityMunicipality);
  }
  if (province) {
    parts.push(province);
  }

  return parts.join(', ');
}
