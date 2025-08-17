import { VStack } from '@/components/ui/vstack';

import React from 'react';

import SafeArea from '@/components/SafeArea';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

export default function FeedPage() {
  const router = useRouter();

  const { data } = useMeUser();

  return (
    <SafeArea safeTop={false} mode="margin" className="items-stretch">
      <ScrollView>
        <VStack space="lg" className="mb-20 items-center justify-center p-5"></VStack>
      </ScrollView>
    </SafeArea>
  );
}
