import { RequestCardSkeleton, RequestListCard } from '@/components/cards/RequestListCard';
import { ProfileTag } from '@/components/ProfileTag';
import { Box, BoxProps } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Request } from '@lactalink/types/payload-generated-types';

export default function MatchedRequestField({
  request,
  isLoading,
  ...props
}: {
  request: Request | null | undefined;
  isLoading?: boolean;
} & BoxProps) {
  return (
    <Box {...props}>
      <Text className="mb-1 font-JakartaSemiBold">Selected Request</Text>
      {request ? (
        <RequestListCard
          isLoading={isLoading}
          data={request}
          footerAction={
            <ProfileTag
              label="Requester"
              profile={{ relationTo: 'individuals', value: request.requester }}
            />
          }
        />
      ) : (
        <RequestCardSkeleton />
      )}
    </Box>
  );
}
