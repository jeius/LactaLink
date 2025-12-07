import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import ChatBox from '@/features/chat/components/ChatBox';
import ChatHeader from '@/features/chat/components/ChatHeader';
import { useConversation } from '@/features/chat/hooks/queries';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function ConversationPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: conversation, ...convoQuery } = useConversation(id);

  if (convoQuery.isLoading || conversation === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <ChatHeader conversation={conversation} />
      <ChatBox conversation={conversation} />
    </SafeArea>
  );
}
