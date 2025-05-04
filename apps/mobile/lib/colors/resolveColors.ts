import { ColorValue } from 'react-native';

type Theme = Record<string, string>;
type ResolvedTheme = Record<string, Record<string | number, ColorValue>>;

export const resolveColors = (theme: Theme): ResolvedTheme => {
  const result: ResolvedTheme = {};

  Object.entries(theme).forEach(([key, value]) => {
    const match = key.match(/^--color-([a-z]+)-(.+)$/);
    if (!match) return;

    const [_, category, shade] = match;
    const formattedCategory = category.toLowerCase();

    if (!result[formattedCategory]) {
      result[formattedCategory] = {};
    }

    const rgbString = value.replace(/,/g, '').trim();
    result[formattedCategory][shade] = `rgb(${rgbString})`;
  });

  return result;
};
