import { getHexColor } from '@/lib/colors';
import { ANDROID_MAPS_API_KEY, IOS_MAPS_API_KEY } from '@/lib/constants';
import { getImageAsset } from '@/lib/stores';
import { Coordinates } from '@lactalink/types';
import { RefObject } from 'react';
import { Platform } from 'react-native';
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteProps,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import { useTheme } from './AppProvider/ThemeProvider';
import { Image } from './Image';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

export type LocationDetails = {
  location: Coordinates;
  googlePlaceData: GooglePlaceData;
  googlePlaceDetail: GooglePlaceDetail | null;
};

interface SearchPlacesProps
  extends Pick<GooglePlacesAutocompleteProps, 'renderLeftButton' | 'renderRightButton'> {
  onSelected?: (value: LocationDetails) => void;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  inputRef?: RefObject<GooglePlacesAutocompleteRef | null>;
}

const API_KEY = Platform.OS === 'ios' ? IOS_MAPS_API_KEY : ANDROID_MAPS_API_KEY;

export function GooglePlacesInput({
  onSelected,
  rounded = 'md',
  inputRef,
  ...props
}: SearchPlacesProps) {
  const { theme } = useTheme();
  const backgroundColor = getHexColor(theme, 'background', 0);
  const borderColor = getHexColor(theme, 'outline', 300);

  let borderRadius: number;
  switch (rounded) {
    case 'sm':
      borderRadius = 6;
      break;
    case 'md':
      borderRadius = 10;
      break;
    case 'lg':
      borderRadius = 14;
      break;
    case 'full':
      borderRadius = 9999; // Full rounded
      break;
    default:
      borderRadius = 10; // Default to md
  }

  function handleSelect(data: GooglePlaceData, detail: GooglePlaceDetail | null) {
    if (detail?.geometry?.location) {
      const location: Coordinates = {
        latitude: detail.geometry.location.lat,
        longitude: detail.geometry.location.lng,
      };
      onSelected?.({ location, googlePlaceData: data, googlePlaceDetail: detail });
    }
  }

  return (
    <GooglePlacesAutocomplete
      ref={inputRef}
      {...props}
      placeholder="Search for a Location"
      textInputProps={{
        selectionHandleColor: getHexColor(theme, 'primary', 500),
        placeholderTextColor: getHexColor(theme, 'typography', 500),
        cursorColor: getHexColor(theme, 'primary', 500),
        returnKeyType: 'search',
      }}
      styles={{
        textInput: {
          borderRadius,
          borderColor: getHexColor(theme, 'outline', 500),
          borderWidth: 1,
          color: getHexColor(theme, 'typography', 900),
          fontSize: 14,
          fontFamily: 'Jakarta-Regular',
          marginHorizontal: 4,
          paddingVertical: 0,
          paddingHorizontal: 12,
          height: 40,
          backgroundColor,
          flex: 1,
        },
        listView: {
          backgroundColor,
          borderRadius: 10,
          borderWidth: 1,
          borderColor,
        },
        separator: { backgroundColor: borderColor },
        row: { padding: 0, backgroundColor: 'transparent' },
        poweredContainer: { borderColor, backgroundColor: getHexColor(theme, 'background', 100) },
      }}
      onPress={handleSelect}
      query={{
        key: API_KEY,
        language: 'en',
        components: 'country:ph',
      }}
      enablePoweredByContainer={true}
      predefinedPlaces={[]}
      autoFillOnNotFound={true}
      currentLocation={false}
      currentLocationLabel="Current location"
      debounce={200}
      disableScroll={false}
      enableHighAccuracyLocation={false}
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
      minLength={1}
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
    <VStack className="mx-auto items-center p-4">
      <Image
        alt="No Data"
        source={getImageAsset('noData_0.75x')}
        style={{ width: 80, aspectRatio: 1 }}
        contentFit="contain"
      />
      <Text className="font-JakartaMedium">No results found.</Text>
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
