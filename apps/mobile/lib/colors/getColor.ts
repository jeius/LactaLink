import { ColorsConfig } from '@/lib/types/colors';
import { ColorValue } from 'react-native';
import { colorsConfig } from './config';

export const getRgbColor = (
  mode: 'light' | 'dark',
  category: keyof ColorsConfig['light'],
  shade: keyof NonNullable<ColorsConfig['light'][keyof ColorsConfig['light']]>
): ColorValue | undefined => {
  const colorValue = colorsConfig?.[mode]?.[category]?.[shade];

  if (!colorValue) return undefined;

  // Normalize color string to ensure consistent comma-separated values
  const formatted = colorValue
    .trim()
    .split(/[\s,]+/) // split by spaces or commas
    .join(',');

  return `rgb(${formatted})`;
};
