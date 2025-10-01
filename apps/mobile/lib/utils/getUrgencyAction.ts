import { BasicBadgeProps } from '@/components/badges';
import { URGENCY_LEVELS } from '@lactalink/enums';

export function getUrgencyAction(urgency: keyof typeof URGENCY_LEVELS) {
  const actionRecord: Record<typeof urgency, BasicBadgeProps['action']> = {
    LOW: 'success',
    MEDIUM: 'info',
    HIGH: 'warning',
    CRITICAL: 'error',
  };
  return actionRecord[urgency];
}
