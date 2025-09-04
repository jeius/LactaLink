import SafeArea from '@/components/SafeArea';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function InventoryLinksPage() {
  const { slug } = useLocalSearchParams();
  return (
    <SafeArea safeTop={false}>
      <Text>{slug}</Text>
    </SafeArea>
  );
}
