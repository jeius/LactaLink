import { getDonationRequestStatusColor } from '@/lib/colors/getColor';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { DonationRequestStatus } from '@lactalink/types';
import { Box } from '../ui/box';
import { Text, TextProps } from '../ui/text';

export default function DonationRequestStatusBadge({
  status,
  size = 'sm',
}: {
  status: DonationRequestStatus;
  size?: TextProps['size'];
}) {
  const statusInfo = DONATION_REQUEST_STATUS[status];
  return (
    <Box
      className="rounded-full px-2 py-1"
      style={{ backgroundColor: getDonationRequestStatusColor(statusInfo.value, '50') }}
    >
      <Text
        bold
        size={size}
        style={{ color: getDonationRequestStatusColor(statusInfo.value, '700') }}
      >
        {statusInfo.label}
      </Text>
    </Box>
  );
}
