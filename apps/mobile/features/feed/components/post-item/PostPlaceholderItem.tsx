import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';

export default function PlaceHolderItem() {
  return (
    <Card variant="filled" className="h-64 rounded-none p-3">
      <HStack space="sm">
        <Skeleton variant="circular" className="h-10 w-10" />
        <VStack space="xs">
          <Skeleton variant="sharp" className="h-4 w-32" />
          <Skeleton variant="sharp" className="h-4 w-10" />
        </VStack>
      </HStack>
      <VStack space="xs" className="mt-4">
        <Skeleton variant="sharp" className="h-5" />
        <Skeleton variant="sharp" className="h-5" />
        <Skeleton variant="sharp" className="h-5" />
        <Skeleton variant="sharp" className="h-5 w-40" />
      </VStack>
      <HStack space="sm" className="flex-1 items-end">
        <Skeleton variant="rounded" className="mt-4 h-8 w-8" />
        <Skeleton variant="rounded" className="mt-4 h-8 w-8" />
      </HStack>
    </Card>
  );
}
