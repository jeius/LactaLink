import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { InfiniteFlashList } from '@/components/ui/list';
import RequestCard from '@/features/donation&request/components/cards/RequestCard';
import { useInfiniteIncomingRequests } from '@/features/donation&request/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Link } from 'expo-router';

export default function IncomingRequestsScreen() {
  const { data: user } = useMeUser();

  const { data, isRefetching, refetch, ...query } = useInfiniteIncomingRequests(user);

  return (
    <InfiniteFlashList
      {...query}
      data={data}
      gap={12}
      contentContainerClassName="p-4"
      contentInsetAdjustmentBehavior="always"
      refreshing={isRefetching}
      onRefresh={refetch}
      renderItem={({ item, isPlaceholder }) => {
        if (isPlaceholder) return <RequestCard.Skeleton />;
        const isUnread = (item.reads?.docs?.length || 0) === 0;
        return (
          <Link asChild push href={`/requests/${item.id}`}>
            <AnimatedPressable className="overflow-hidden rounded-2xl">
              <RequestCard data={item} orientation="horizontal" />
              {isUnread && (
                <Box
                  className="absolute h-2 w-2 rounded-full bg-primary-500"
                  style={{ top: 14, right: 14 }}
                />
              )}
            </AnimatedPressable>
          </Link>
        );
      }}
    />
  );
}
