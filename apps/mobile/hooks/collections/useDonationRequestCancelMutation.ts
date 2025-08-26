import { getApiClient } from '@lactalink/api';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import {
  Collection,
  CollectionSlug,
  Donation,
  DonationRequestStatus,
  PaginatedDocs,
  Request,
} from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities';
import { InfiniteData, QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

export function useDonationRequestCancelMutation<
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

export function isStatusPendingOrAvailable<T extends Donation | Request>(
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
