import CreateChatButton from '@/features/chat/components/CreateChatButton';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function ChatsLayout() {
  const screenOptions = useScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: 'Chats',
          headerRight: CreateChatButton,
        }}
      />
    </Stack>
  );
}
