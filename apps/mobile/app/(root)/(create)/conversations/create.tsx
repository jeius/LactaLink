import CreateDirectChat from '@/features/chat/components/CreateDirectChat';
import CreateGroupChat from '@/features/chat/components/CreateGroupChat';
import { CreateConvoSearchParams } from '@/features/chat/lib/types';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function CreateConversationPage() {
  const { type } = useLocalSearchParams<CreateConvoSearchParams>();
  if (type === 'group') return <CreateGroupChat />;
  return <CreateDirectChat />;
}
