import { ColorCategory, ColorsConfig, Shade } from '@/lib/types/colors';
import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { Theme } from '@lactalink/types';
import { ColorValue } from 'react-native';
import { getTheme } from '../stores/themeStore';
import { colorsConfig } from './config';

export const getHexColor = (
  mode: 'light' | 'dark',
  category: keyof ColorsConfig['light'],
  shade: keyof NonNullable<ColorsConfig['light'][keyof ColorsConfig['light']]>
): ColorValue | undefined => {
  const colorValue = colorsConfig?.[mode]?.[category]?.[shade];

  if (!colorValue) return undefined;

  const formatted = colorValue.trim();

  return formatted;
};

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

export function getMilkBagStatusColor(
  theme: Theme,
  status?: keyof typeof MILK_BAG_STATUS,
  shade: number = 400
): ColorValue {
  const colors: Record<keyof typeof MILK_BAG_STATUS, ColorCategory> = {
    AVAILABLE: 'primary',
    ALLOCATED: 'success',
    CONSUMED: 'success',
    EXPIRED: 'background',
    DISCARDED: 'error',
    DRAFT: 'warning',
  };

  return (status && getHexColor(theme, colors[status], shade)) || '#a2a3a3';
}

export function getDonationRequestStatusColor(
  theme: Theme,
  status?: keyof typeof DONATION_REQUEST_STATUS,
  shade: number = 400
): ColorValue {
  const colors: Record<keyof typeof DONATION_REQUEST_STATUS, ColorCategory> = {
    PENDING: 'warning',
    AVAILABLE: 'primary',
    COMPLETED: 'success',
    MATCHED: 'info',
    REJECTED: 'error',
    EXPIRED: 'background',
    CANCELLED: 'background',
  };

  return (status && getHexColor(theme, colors[status], shade)) || '#a2a3a3';
}

export function getPrimaryColor(shade: Shade = '500') {
  const theme = getTheme();
  return getHexColor(theme, 'primary', shade)?.toString();
}

export function getTypographyColor(shade: Shade = '950') {
  const theme = getTheme();
  return getHexColor(theme, 'typography', shade)?.toString();
}

export function getColor(category: ColorCategory, shade: Shade) {
  const theme = getTheme();
  return colorsConfig[theme][category][shade] || 'transparent';
}
