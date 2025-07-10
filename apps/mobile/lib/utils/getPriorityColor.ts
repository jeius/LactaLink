import { PRIORITY_LEVELS } from '@lactalink/enums';
import { Theme } from '@lactalink/types';
import { ColorValue } from 'react-native';
import { getHexColor } from '../colors';
import { ColorCategory } from '../types/colors';

export function getPriorityColor(theme: Theme, urgency?: keyof typeof PRIORITY_LEVELS): ColorValue {
  const priorityColors: Record<keyof typeof PRIORITY_LEVELS, ColorCategory> = {
    LOW: 'success',
    MEDIUM: 'secondary',
    HIGH: 'warning',
    CRITICAL: 'error',
  };

  return (urgency && getHexColor(theme, priorityColors[urgency] || 'background', 400)) || '#a2a3a3';
}
