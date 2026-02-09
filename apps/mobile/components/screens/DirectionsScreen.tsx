import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import GooglePlacesTextInput from '../GooglePlacesTextInput';

export default function DirectionsScreen() {
  return (
    <SafeAreaView className="gap-10 p-4">
      <GooglePlacesTextInput />
    </SafeAreaView>
  );
}
