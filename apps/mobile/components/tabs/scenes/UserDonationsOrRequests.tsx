import { EditActionButton } from '@/components/buttons';
import { DonationListCard, RequestListCard } from '@/components/cards';
import { useScrollHandlers } from '@/components/contexts/ScrollProvider';
import { InfiniteList } from '@/components/lists/InfiniteList';
import { ActionModal } from '@/components/modals';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { useMeUser } from '@/hooks/auth/useAuth';
import { INFINITE_QUERY_KEY } from '@/lib/constants';
import { getTimeStampWithLabel } from '@/lib/utils/getTimestampWithLabel';

import { getApiClient } from '@lactalink/api';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { DonationRequestStatus } from '@lactalink/types';
import { Collection } from '@lactalink/types/collections';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { CollectionSlug, PaginatedDocs, Where } from '@lactalink/types/payload-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { formatKebabToTitle } from '@lactalink/utilities/formatters';
import { isDonation } from '@lactalink/utilities/type-guards';

import { InfiniteData, QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, Stack } from 'expo-router';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { SceneProps } from './types';

interface UserDonationsOrRequestsSceneProps extends SceneProps {
  collection: Extract<CollectionSlug, 'donations' | 'requests'>;
}

export function UserDonationsOrRequestsScene({
  route,
  collection,
}: UserDonationsOrRequestsSceneProps) {
  const meUser = useMeUser();

  const insets = useSafeAreaInsets();
  const scrollHandlers = useScrollHandlers();

  const user = meUser.data;
  const profile = user?.profile;
  const profileID = profile?.value && extractID(profile.value);

  const headerTitle = useMemo(() => `My ${formatKebabToTitle(collection)}`, [collection]);

  const where = useMemo((): Where => {
    const conditions: Where[] = [{ status: { equals: route.key } }];

    if (!profileID) return { and: conditions };

    if (collection === 'donations') {
      conditions.push({ donor: { equals: profileID } });
    } else {
      conditions.push({ requester: { equals: profileID } });
    }

    return { and: conditions };
  }, [collection, profileID, route.key]);

  const queryKey = [...INFINITE_QUERY_KEY, collection, { where }];
  const actionMutation = useDonationRequestCancelMutation(queryKey, collection);

  return (
    <Box className="flex-1" style={{ marginBottom: insets.bottom }}>
      <Stack.Screen options={{ headerTitle }} />
      <InfiniteList
        {...scrollHandlers}
        slug={collection}
        fetchOptions={{ where }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        ItemComponent={({ item, isLoading }) => {
          if (isLoading) {
            return <DonationListCard isLoading />;
          }

          const isStatusMatched = DONATION_REQUEST_STATUS.MATCHED.value === item.status;
          const timestamp = getTimeStampWithLabel(item);

          function Action() {
            return (
              isStatusPendingOrAvailable(item.status) && (
                <VStack className="justify-start">
                  <EditActionButton href={`/${collection}/${item.id}/edit`} />
                </VStack>
              )
            );
          }

          function FooterAction() {
            return (
              <HStack space="sm" className="flex-1 items-center justify-end">
                {!isStatusMatched && (
                  <VStack className="flex-1">
                    <Text size="xs" className="text-typography-700">
                      {timestamp?.label}
                    </Text>
                    <Text size="xs" className="text-typography-700">
                      {timestamp?.value}
                    </Text>
                  </VStack>
                )}
                {isStatusPendingOrAvailable(item.status) ? (
                  <ActionModal
                    size="xs"
                    variant="outline"
                    action="negative"
                    triggerLabel="Cancel"
                    title={`Cancel ${isDonation(item) ? 'Donation' : 'Request'}`}
                    onConfirm={() => actionMutation.mutateAsync(item)}
                    description={`Are you sure you want to cancel this ${isDonation(item) ? 'donation' : 'request'}? This action cannot be undone.`}
                  />
                ) : (
                  <Link push asChild href={`/${collection}/${item.id}`}>
                    <Button size="xs" variant="outline" action="default">
                      <ButtonText>View Details</ButtonText>
                    </Button>
                  </Link>
                )}
              </HStack>
            );
          }

          return isDonation(item) ? (
            <DonationListCard
              data={item}
              showProgressBar={isStatusMatched}
              action={<Action />}
              footerAction={<FooterAction />}
            />
          ) : (
            <RequestListCard
              data={item}
              showProgressBar={isStatusMatched}
              action={<Action />}
              footerAction={<FooterAction />}
            />
          );
        }}
      />
    </Box>
  );
}

//#region Helpers

function useDonationRequestCancelMutation<
  TSlug extends Extract<CollectionSlug, 'donations' | 'requests'>,
>(queryKey: unknown[], collection: TSlug) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Collection<TSlug>) => updateStatus(data, collection),
    onMutate: onMutate(queryClient, queryKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.slice(0, -2) });
    },
    onError: (err, _vars, ctx) => {
      const message = extractErrorMessage(err);
      toast.error(`Failed to cancel donation: ${message}`);
      queryClient.setQueryData(queryKey, ctx?.previousData);
    },
  });
}

function isStatusPendingOrAvailable<T extends Donation | Request>(
  stat: T['status']
): stat is Extract<DonationRequestStatus, 'PENDING' | 'AVAILABLE'> {
  const pendingStatus: string = DONATION_REQUEST_STATUS.PENDING.value;
  const availableStatus: string = DONATION_REQUEST_STATUS.AVAILABLE.value;
  return [pendingStatus, availableStatus].includes(stat);
}

async function updateStatus<TSlug extends Extract<CollectionSlug, 'donations' | 'requests'>>(
  data: Collection<TSlug>,
  slug: TSlug
) {
  const apiClient = getApiClient();
  const { id, status } = data;

  if (!isStatusPendingOrAvailable(status)) {
    throw new Error('Only pending or available donations can be cancelled.');
  }

  return await apiClient.updateByID({
    collection: slug,
    id,
    //@ts-expect-error Update data type is not correctly inferred
    data: {
      status: DONATION_REQUEST_STATUS.CANCELLED.value,
      cancelledAt: new Date().toISOString(),
    },
    depth: 3,
  });
}

function onMutate(queryClient: QueryClient, queryKey: unknown[]) {
  type ListData = InfiniteData<PaginatedDocs<Donation | Request>>;
  return async (vars: Donation | Request) => {
    const { status } = vars;

    if (!isStatusPendingOrAvailable(status)) {
      throw new Error('Only pending or available donations can be cancelled.');
    }

    await queryClient.cancelQueries({ queryKey });
    const previousData = queryClient.getQueryData<ListData>(queryKey);

    queryClient.setQueryData<ListData | undefined>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      const newPages = oldData.pages.map((page) => {
        const newDocs = page.docs.filter((doc) => doc.id !== vars.id);
        return { ...page, docs: newDocs };
      });

      return { ...oldData, pages: newPages };
    });

    return { previousData };
  };
}

//#endregion Helpers
