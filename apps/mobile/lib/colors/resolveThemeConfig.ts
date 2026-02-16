import { ColorsConfig, ThemeColors } from '@/lib/types/colors';
import { vars } from 'nativewind';

type ColorObject = Record<string, string>;
type Config = { light: ColorObject; dark: ColorObject };

function flattenColors(config: ThemeColors, prefix = '--color'): ColorObject {
  const result: ColorObject = {};

  for (const [category, value] of Object.entries(config)) {
    if (typeof value === 'object' && value !== null) {
      for (const [key, color] of Object.entries(value)) {
        result[`${prefix.trim()}-${category}-${key}`] = color;
      }
    } else if (typeof value === 'string') {
      // for non-scale values like background-error
      result[`${prefix.trim()}-${category}`] = value;
    }
  }

  return result;
}

export function resolveThemeConfig(config: ColorsConfig): Config {
  const lightColors = flattenColors(config.light);
  const darkColors = flattenColors(config.dark);
  return {
    light: vars(lightColors),
    dark: vars(darkColors),
  };
}
