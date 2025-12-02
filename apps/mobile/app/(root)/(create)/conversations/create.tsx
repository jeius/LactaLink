import CreateDirectChat from '@/features/chat/components/CreateDirectChat';
import { CreateConvoSearchParams } from '@/features/chat/lib/types';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function CreateConversationPage() {
  const { type = 'direct' } = useLocalSearchParams<CreateConvoSearchParams>();
  return <CreateDirectChat />;
}
