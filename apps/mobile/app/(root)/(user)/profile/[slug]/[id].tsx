import { Text } from '@/components/ui/text';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function ProfilePage() {
  const { slug, id } = useLocalSearchParams<{ slug: string; id: string }>();

  return (
    <View>
      <Text>{slug}</Text> : <Text>{id}</Text>
    </View>
  );
}
