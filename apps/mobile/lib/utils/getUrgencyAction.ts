import { BasicBadgeProps } from '@/components/badges';
import { URGENCY_LEVELS } from '@lactalink/enums';
import { getColor } from '../colors';
import { ColorCategory, Shade } from '../types/colors';

export function getUrgencyAction(urgency: keyof typeof URGENCY_LEVELS) {
  const actionRecord: Record<typeof urgency, BasicBadgeProps['action']> = {
    LOW: 'success',
    MEDIUM: 'info',
    HIGH: 'warning',
    CRITICAL: 'error',
  };
  return actionRecord[urgency];
}

export function getUrgencyColor(urgency: keyof typeof URGENCY_LEVELS, shade: Shade = '500') {
  const colorRecord: Record<typeof urgency, ColorCategory> = {
    LOW: 'success',
    MEDIUM: 'info',
    HIGH: 'warning',
    CRITICAL: 'error',
  };

  return getColor(colorRecord[urgency], shade);
}
