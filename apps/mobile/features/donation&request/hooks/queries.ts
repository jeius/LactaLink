import { useMeUser } from '@/hooks/auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
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

export function useRequest(id: string | undefined) {
  return useQuery(createRequestQuery(id));
}
