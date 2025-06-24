import { getHexColor } from '@/lib/colors';
import { ANDROID_MAPS_API_KEY, IOS_MAPS_API_KEY } from '@/lib/constants';
import { LucideSearchX } from 'lucide-react-native';
import { Platform } from 'react-native';
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from 'react-native-google-places-autocomplete';
import { LatLng } from 'react-native-maps';
import { useTheme } from './AppProvider/ThemeProvider';
import { Icon } from './ui/icon';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

interface SearchPlacesProps {
  onSelected?: (value: { location: LatLng }) => void;
}

const API_KEY = Platform.OS === 'ios' ? IOS_MAPS_API_KEY : ANDROID_MAPS_API_KEY;

export function GooglePlacesInput({ onSelected }: SearchPlacesProps) {
  const { theme } = useTheme();
  const backgroundColor = getHexColor(theme, 'background', 0);
  const borderColor = getHexColor(theme, 'outline', 300);

  function handleSelect(data: GooglePlaceData, detail: GooglePlaceDetail | null) {
    if (detail?.geometry?.location) {
      const location: LatLng = {
        latitude: detail.geometry.location.lat,
        longitude: detail.geometry.location.lng,
      };
      onSelected?.({ location });
    }
  }

  return (
    <GooglePlacesAutocomplete
      placeholder="Search for a Location"
      textInputProps={{
        selectionHandleColor: getHexColor(theme, 'primary', 500),
        placeholderTextColor: getHexColor(theme, 'typography', 500),
        cursorColor: getHexColor(theme, 'primary', 500),
        returnKeyType: 'search',
        className: 'border flex-1 border-outline-500 text-sm px-3 py-0 text-typography-900',
      }}
      styles={{
        textInput: {
          borderRadius: 10,
          fontFamily: 'Jakarta-Regular',
          marginHorizontal: 4,
          height: 40,
          backgroundColor,
        },
        listView: {
          backgroundColor,
          borderRadius: 10,
          borderWidth: 1,
          borderColor,
        },
        separator: { backgroundColor: borderColor },
        row: { padding: 0, backgroundColor: 'transparent' },
        poweredContainer: { borderColor, backgroundColor: getHexColor(theme, 'background', 300) },
      }}
      onPress={handleSelect}
      query={{
        key: API_KEY,
        language: 'en',
        components: 'country:ph',
      }}
      enablePoweredByContainer={true}
      predefinedPlaces={[]}
      autoFillOnNotFound={false}
      currentLocation={false}
      currentLocationLabel="Current location"
      debounce={0}
      disableScroll={false}
      enableHighAccuracyLocation={true}
      fetchDetails={true}
      filterReverseGeocodingByTypes={[]}
      GooglePlacesDetailsQuery={{ rankby: 'distance' }}
      GooglePlacesSearchQuery={{ rankby: 'distance' }}
      GoogleReverseGeocodingQuery={{}}
      isRowScrollable={true}
      keyboardShouldPersistTaps="handled"
      listHoverColor={getHexColor(theme, 'primary', 100)?.toString()}
      listUnderlayColor={getHexColor(theme, 'primary', 100)?.toString()}
      listEmptyComponent={ListEmpty}
      listLoaderComponent={() => <Spinner className="m-5" size={'large'} />}
      renderRow={RenderRow}
      listViewDisplayed={'auto'}
      keepResultsAfterBlur={false}
      minLength={2}
      nearbyPlacesAPI="GooglePlacesSearch"
      numberOfLines={1}
      onFail={(e) => {
        console.warn('Google Place Failed : ', e);
      }}
      onNotFound={() => {}}
      onTimeout={() => console.warn('google places autocomplete: request timeout')}
      predefinedPlacesAlwaysVisible={false}
      suppressDefaultStyles={false}
      textInputHide={false}
      timeout={1000 * 20} // 20 seconds
      fields="*"
    />
  );
}

function ListEmpty() {
  return (
    <VStack space="lg" className="mx-auto items-center p-4">
      <Icon as={LucideSearchX} className="text-primary-500 h-12 w-12" />
      <Text size="md">No results found.</Text>
    </VStack>
  );
}

function RenderRow(data: GooglePlaceData) {
  const { description } = data;

  return (
    <Text size="sm" className="h-full px-3 py-4 font-sans">
      {description}
    </Text>
  );
}
