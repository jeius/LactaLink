import { Box } from '@/components/ui/box';
import { Text, TextProps } from '@/components/ui/text';
import { getDonationRequestStatusColor } from '@/lib/colors/getColor';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { DonationRequestStatus } from '@lactalink/types';

export default function StatusBadge({
  status,
  size = 'sm',
}: {
  status: DonationRequestStatus;
  size?: TextProps['size'];
}) {
  const statusInfo = DONATION_REQUEST_STATUS[status];
  return (
    <Box
      className="rounded-md px-2 py-1"
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
