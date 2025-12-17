import { useMeUser } from '@/hooks/auth/useAuth';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createDonationQuery } from '../lib/queryOptions/donations';
import { createDraftMilkbagsQuery } from '../lib/queryOptions/milkbags';
import { createRequestQuery } from '../lib/queryOptions/request';

export function useDraftMilkbags() {
  const { data: user } = useMeUser();
  const { data, ...query } = useQuery(createDraftMilkbagsQuery(user));

  const dataArray = useMemo(() => {
    if (!data) return data;
    return Array.from(data.values());
  }, [data]);

  return { ...query, data: dataArray, dataMap: data };
}

export function useRequest(data: string | Request | undefined) {
  return useQuery(createRequestQuery(data));
}

export function useDonation(data: string | Donation | undefined) {
  return useQuery(createDonationQuery(data));
}
