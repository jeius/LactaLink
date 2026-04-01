import { Box, BoxProps } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import DonationCard from '../cards/DonationCard';
import RequestCard from '../cards/RequestCard';

export function MatchedDonationField({
  donation,
  isLoading,
  ...props
}: {
  donation: Donation | null | undefined;
  isLoading?: boolean;
} & BoxProps) {
  if (donation === null) return null;

  return (
    <Box {...props}>
      <Text className="mb-1 font-JakartaSemiBold">Selected Donation</Text>
      {isLoading || !donation ? <DonationCard.Skeleton /> : <DonationCard data={donation} />}
    </Box>
  );
}

export function MatchedRequestField({
  request,
  isLoading,
  ...props
}: {
  request: Request | null | undefined;
  isLoading?: boolean;
} & BoxProps) {
  if (request === null) return null;

  return (
    <Box {...props}>
      <Text className="mb-1 font-JakartaSemiBold">Selected Request</Text>
      {isLoading || !request ? <RequestCard.Skeleton /> : <RequestCard data={request} />}
    </Box>
  );
}
