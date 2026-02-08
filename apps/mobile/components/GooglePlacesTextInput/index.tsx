import React, { useCallback } from 'react';
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { GooglePlacesFieldMask } from '@lactalink/types/geocoding';
import RNGooglePlacesTextInput, { type Place } from 'react-native-google-places-textinput';

import { getColor } from '@/lib/colors';
import { ANDROID_MAPS_API_KEY, IOS_MAPS_API_KEY } from '@/lib/constants/env';
import { shadow } from '@/lib/utils/shadows';
import { XIcon } from 'lucide-react-native';
import { Icon } from '../ui/icon';

const API_KEY = Platform.select({
  ios: IOS_MAPS_API_KEY,
  android: ANDROID_MAPS_API_KEY,
});

const DEFAULT_DETAIL_FIELDS: GooglePlacesFieldMask[] = [
  'addressComponents',
  'formattedAddress',
  'location',
  'viewport',
  'photos',
  'types',
];

interface GooglePlacesTextInputProps {
  onSelect?: (place: Place) => void;
  style?: StyleProp<ViewStyle>;
}

export default function GooglePlacesTextInput({ onSelect, style }: GooglePlacesTextInputProps) {
  const styles = createStyles();

  const onPlaceSelect = useCallback(
    (place: Place, sessionToken?: string | null) => {
      console.log('Selected place:', place, 'Session Token:', sessionToken);
      onSelect?.(place);
    },
    [onSelect]
  );

  return (
    <RNGooglePlacesTextInput
      apiKey={API_KEY}
      onPlaceSelect={onPlaceSelect}
      onError={(e) => console.warn('GooglePlacesTextInput Error:', e)}
      detailsFields={DEFAULT_DETAIL_FIELDS}
      cursorColor={getColor('primary', '500')}
      placeHolderText="Search a place..."
      placeholderClassName="font-sans"
      keyboardType="default"
      returnKeyType="search"
      textContentType="location"
      clearElement={<Icon as={XIcon} className="stroke-typography-500" />}
      fetchDetails={true}
      suggestionTextProps={{
        mainTextNumberOfLines: 2,
        secondaryTextNumberOfLines: 2,
        ellipsizeMode: 'tail',
      }}
      style={{
        container: style,
        input: styles.input,
        inputContainer: styles.inputContainer,
        suggestionText: {
          main: styles.suggestionTextMain,
          secondary: styles.suggestionTextSecondary,
        },
        suggestionsContainer: styles.suggestionsContainer,
        loadingIndicator: styles.loadingIndicator,
        placeholder: styles.placeholder,
      }}
    />
  );
}

function createStyles() {
  return StyleSheet.create({
    inputContainer: {
      borderRadius: 14,
      borderColor: getColor('outline', '200'),
      backgroundColor: getColor('background', '0'),
      ...shadow.sm,
    },
    input: {
      color: getColor('typography', '950'),
      fontFamily: 'Jakarta-Medium',
      fontSize: 14,
    },
    suggestionTextMain: {
      fontFamily: 'Jakarta-Medium',
      fontSize: 14,
      color: getColor('typography', '950'),
    },
    suggestionTextSecondary: {
      fontFamily: 'Jakarta-Regular',
      fontSize: 12,
      color: getColor('typography', '800'),
    },
    suggestionsContainer: {
      backgroundColor: getColor('background', '0'),
      borderRadius: 12,
      ...shadow.sm,
    },
    loadingIndicator: { color: getColor('primary', '500') },
    placeholder: { color: getColor('outline', '700') },
  });
}
