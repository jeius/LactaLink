import { queryOptions, useQuery } from '@tanstack/react-query';

async function getSeedStatus(id?: string): Promise<string[]> {
  if (!id) return [];

  const res = await fetch(`/api/seed/status/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return ['An unexpected error occured.'];
  }

  return data;
}

function seedOptions(id?: string) {
  return queryOptions({
    queryKey: ['seed', 'status', id],
    queryFn: () => getSeedStatus(id),
    staleTime: 2 * 1000,
    refetchInterval: 2 * 1000,
    refetchOnMount: true,
    refetchIntervalInBackground: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

export default function Loading({ seedID }: { seedID?: string }) {
  const { data } = useQuery(seedOptions(seedID));

  let status = 'Loading...';

  if (data && data.length > 0) {
    status = data.pop() || 'Loading...';
  }
  return <p>{status}</p>;
}
