import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';

export default function CommentItemPlaceholder() {
  return (
    <HStack space="sm">
      <Skeleton variant="circular" style={{ width: 32, height: 32 }} />
      <VStack space="xs" className="h-32 flex-1">
        <Skeleton variant="sharp" className="mb-1 h-4 w-28" />
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} variant="sharp" className="h-5 w-full" />
        ))}
        <Skeleton variant="sharp" className="mt-1 h-4 w-12" />
      </VStack>
    </HStack>
  );
}
