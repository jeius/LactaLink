import { ColorsConfig, ThemeMode } from '@/lib/types/colors';
import { vars } from 'nativewind';

type ColorObject = Record<string, string>;
type Config = { light: ColorObject; dark: ColorObject };

function flattenColors(config: ThemeMode, prefix = '--color-'): ColorObject {
  const result: ColorObject = {};

  for (const [category, value] of Object.entries(config)) {
    if (typeof value === 'object' && value !== null) {
      for (const [key, color] of Object.entries(value)) {
        result[`${prefix}${category}-${key}`] = color;
      }
    } else if (typeof value === 'string') {
      // for non-scale values like background-error
      result[`${prefix}${category}`] = value;
    }
  }

  return result;
}

export function resolveThemeConfig(config: ColorsConfig): Config {
  return {
    light: vars(flattenColors(config.light)),
    dark: vars(flattenColors(config.dark)),
  };
}
