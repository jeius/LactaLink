import SafeArea from '@/components/SafeArea';
import { RequestListCard } from '@/components/cards';
import { InfiniteList } from '@/components/lists';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Where } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { Stack } from 'expo-router';
import React from 'react';

export default function AccountIncomingRequests() {
  const { data: user } = useMeUser();
  const userID = extractID(user);

  const where: Where | undefined = userID
    ? {
        'recipient.value': { equals: userID },
      }
    : undefined;

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <Stack.Screen options={{ headerTitle: 'Incoming Requests' }} />
      <InfiniteList
        slug="requests"
        contentContainerStyle={{ padding: 16 }}
        fetchOptions={{ where }}
        emptyListLabel="You have no incoming requests"
        ItemComponent={({ item, isLoading }) => {
          return <RequestListCard data={item} isLoading={isLoading} />;
        }}
      />
    </SafeArea>
  );
}
