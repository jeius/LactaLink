import { StyleSheet } from 'react-native';

function getShadowColor(opacity: number = 0.05) {
  return `rgba(0,0,0,${opacity})`;
}

export function createDirectionalShadow(
  direction: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
  intensity: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md',
  opacity?: number
) {
  const intensityMap = {
    xs: { offset: 1, blur: 2, spread: 0 },
    sm: { offset: 1, blur: 3, spread: 0 },
    md: { offset: 4, blur: 6, spread: -1 },
    lg: { offset: 10, blur: 15, spread: -3 },
    xl: { offset: 20, blur: 25, spread: -5 },
  };

  const config = intensityMap[intensity];

  const offsets = {
    top: { width: 0, height: -config.offset },
    bottom: { width: 0, height: config.offset },
    left: { width: -config.offset, height: 0 },
    right: { width: config.offset, height: 0 },
  };

  const offset = offsets[direction];

  const shadowColor = getShadowColor(opacity);

  return {
    boxShadow: `${offset.width}px ${offset.height}px ${config.blur}px ${config.spread}px ${shadowColor}`,
  };
}

export function createShadow(opacity?: number) {
  return StyleSheet.create({
    xs: createDirectionalShadow('bottom', 'xs', opacity),
    sm: createDirectionalShadow('bottom', 'sm', opacity),
    md: createDirectionalShadow('bottom', 'md', opacity),
    lg: createDirectionalShadow('bottom', 'lg', opacity),
    xl: createDirectionalShadow('bottom', 'xl', opacity),
  });
}

export const shadow = createShadow();
