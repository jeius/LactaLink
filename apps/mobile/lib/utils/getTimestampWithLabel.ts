import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';

export function getTimeStampWithLabel(
  data: Donation | Request
): { value: string; label: string } | null {
  const { status } = data;
  switch (status) {
    case DONATION_REQUEST_STATUS.COMPLETED.value:
      return data.completedAt
        ? {
            value: `${formatDate(data.completedAt, { shortMonth: true })}, ${formatLocaleTime(data.completedAt)}`,
            label: 'Completed At',
          }
        : null;
    case DONATION_REQUEST_STATUS.CANCELLED.value:
      return data.cancelledAt
        ? {
            value: `${formatDate(data.cancelledAt, { shortMonth: true })}, ${formatLocaleTime(data.cancelledAt)}`,
            label: 'Cancelled At',
          }
        : null;
    case DONATION_REQUEST_STATUS.EXPIRED.value:
      return data.expiredAt
        ? {
            value: `${formatDate(data.expiredAt, { shortMonth: true })}, ${formatLocaleTime(data.expiredAt)}`,
            label: 'Expired At',
          }
        : null;
    case DONATION_REQUEST_STATUS.REJECTED.value:
      return data.rejectedAt
        ? {
            value: `${formatDate(data.rejectedAt, { shortMonth: true })}, ${formatLocaleTime(data.rejectedAt)}`,
            label: 'Rejected At',
          }
        : null;
    default:
      return {
        value: `${formatDate(data.createdAt, { shortMonth: true })}, ${formatLocaleTime(data.createdAt)}`,
        label: 'Created At',
      };
  }
}
