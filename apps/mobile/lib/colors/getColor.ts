import { ColorCategory, ColorsConfig, Shade, ThemeColors } from '@/lib/types/colors';
import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { produce } from 'immer';
import { ColorValue } from 'react-native';
import { getTheme } from '../stores/themeStore';
import { colorsConfig } from './config';

export function formatToRgb(color: string): string {
  // Normalize color string to ensure consistent comma-separated values
  const formatted = color
    .trim()
    .split(/[\s,]+/) // split by spaces or commas
    .join(',');

  return `rgb(${formatted})`;
}

export function getRgbColor(
  mode: 'light' | 'dark',
  category: keyof ColorsConfig['light'],
  shade: keyof NonNullable<ColorsConfig['light'][keyof ColorsConfig['light']]>
): string | undefined {
  const colorValue = colorsConfig?.[mode]?.[category]?.[shade];

  if (!colorValue) return undefined;

  return formatToRgb(colorValue);
}

export function getThemeColors(mode: 'light' | 'dark'): ThemeColors {
  const colors = colorsConfig[mode];
  return produce(colors, (draft) => {
    for (const value of Object.values(draft)) {
      for (const [shade, color] of Object.entries(value)) {
        if (color) value[shade] = formatToRgb(color);
      }
    }
  });
}

export function getHexColor(
  mode: 'light' | 'dark',
  category: keyof ColorsConfig['light'],
  shade: keyof NonNullable<ColorsConfig['light'][keyof ColorsConfig['light']]>
): ColorValue | undefined {
  return getRgbColor(mode, category, shade);
}

export function getMilkBagStatusColor(
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

  return (status && getColor(colors[status], shade.toString() as Shade)) || '#a2a3a3';
}

export function getColor(category: ColorCategory, shade: Shade) {
  const theme = getTheme();
  return getRgbColor(theme, category, shade) || 'transparent';
}

export function getPrimaryColor(shade: Shade = '500') {
  return getColor('primary', shade);
}

export function getTypographyColor(shade: Shade = '950') {
  return getColor('typography', shade);
}

export function getDonationRequestStatusColor(
  status?: keyof typeof DONATION_REQUEST_STATUS,
  shade: Shade = '400'
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

  return (status && getColor(colors[status], shade)) || '#a2a3a3';
}
