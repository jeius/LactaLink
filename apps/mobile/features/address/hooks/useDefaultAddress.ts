import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { UserProfile } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { createDefaultAddressQuery } from '../lib/queryOptions';

export function useDefaultAddress(profile: UserProfile | null | undefined) {
  const { data: profileData, ...profileQuery } = useProfileData(profile);
  const ownerID = extractID(profileData?.value.owner);

  const { data: address, ...addressQuery } = useQuery(createDefaultAddressQuery(ownerID));

  const refetch = useCallback(() => {
    profileQuery.refetch();
    addressQuery.refetch();
  }, [profileQuery, addressQuery]);

  return {
    address,
    profile: profileData,
    isLoading: profileQuery.isLoading || addressQuery.isLoading,
    isPending: profileQuery.isPending || addressQuery.isPending,
    isFetching: profileQuery.isFetching || addressQuery.isFetching,
    isRefetching: profileQuery.isRefetching || addressQuery.isRefetching,
    error: profileQuery.error || addressQuery.error,
    isError: profileQuery.isError || addressQuery.isError,
    refetch,
  };
}
