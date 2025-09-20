import SafeArea from '@/components/SafeArea';
import { DonationListCard } from '@/components/cards';
import { InfiniteList } from '@/components/lists';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Where } from '@lactalink/types/payload-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { Link, Stack } from 'expo-router';
import React from 'react';

export default function AccountIncomingDonations() {
  const { data: user } = useMeUser();
  const profile = extractCollection(user?.profile);
  const profileID = extractID(profile?.value);
  const profileSlug = profile?.relationTo;

  const where: Where | undefined =
    profileID && profileSlug
      ? {
          and: [
            { 'recipient.value': { equals: profileID } },
            { 'recipient.relationTo': { equals: profileSlug } },
            { status: { equals: DONATION_REQUEST_STATUS.PENDING.value } },
          ],
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
          return (
            <DonationListCard
              data={item}
              isLoading={isLoading}
              showAvatar
              showMinDistance
              canViewThumbnail={true}
              action={
                <VStack className="justify-center">
                  <Link asChild push href={`/donations/${item.id}`}>
                    <Button>
                      <ButtonText>View</ButtonText>
                    </Button>
                  </Link>
                </VStack>
              }
            />
          );
        }}
      />
    </SafeArea>
  );
}
