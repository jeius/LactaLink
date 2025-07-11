import { URGENCY_LEVELS } from '@lactalink/enums';
import { Theme } from '@lactalink/types';
import { ColorValue } from 'react-native';
import { getHexColor } from '../colors';
import { ColorCategory } from '../types/colors';

export function getPriorityColor(
  theme: Theme,
  urgency?: keyof typeof URGENCY_LEVELS,
  shade: number = 400
): ColorValue {
  const priorityColors: Record<keyof typeof URGENCY_LEVELS, ColorCategory> = {
    LOW: 'success',
    MEDIUM: 'secondary',
    HIGH: 'warning',
    CRITICAL: 'error',
  };

  return (
    (urgency && getHexColor(theme, priorityColors[urgency] || 'background', shade)) || '#a2a3a3'
  );
}
