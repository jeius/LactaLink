import SafeArea from '@/components/SafeArea';
import { DonationListCard } from '@/components/cards';
import { InfiniteList } from '@/components/lists';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Where } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { Stack } from 'expo-router';
import React from 'react';

export default function AccountIncomingDonations() {
  const { data: user } = useMeUser();
  const userID = extractID(user);

  const where: Where | undefined = userID
    ? {
        'recipient.value': { equals: userID },
      }
    : undefined;

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <Stack.Screen options={{ headerTitle: 'Incoming Donations' }} />
      <InfiniteList
        slug="donations"
        contentContainerStyle={{ padding: 16 }}
        fetchOptions={{ where }}
        emptyListLabel="You have no incoming donations"
        ItemComponent={({ item, isLoading }) => {
          return <DonationListCard data={item} isLoading={isLoading} />;
        }}
      />
    </SafeArea>
  );
}
