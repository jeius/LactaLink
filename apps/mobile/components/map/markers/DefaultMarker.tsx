import { useTheme } from '@/components/AppProvider/ThemeProvider';
import LocationPin from '@/components/icons/LocationPin';
import { getHexColor } from '@/lib/colors';
import { ReactNode } from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

const sizes = {
  '2xs': 16,
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
  '2xl': 64,
  '3xl': 72,
};

interface DefaultMarkerProps {
  size?: number | keyof typeof sizes;
  color?: ColorValue | string;
  circleColor?: ColorValue | string;
  circleIcon?: ReactNode;
}

export function DefaultMarker({
  size: sizeProp = sizes.lg,
  color,
  circleColor,
  circleIcon,
}: DefaultMarkerProps) {
  const { theme } = useTheme();

  const pinColor = color || getHexColor(theme, 'primary', 500);
  const circleBgColor = circleColor || getHexColor(theme, 'primary', 50);

  const size = typeof sizeProp === 'string' ? sizes[sizeProp] : sizeProp;
  const circleRadius = size * 0.25; // 25% of the marker size;

  const style = StyleSheet.create({
    container: { position: 'relative', width: size, height: size },
    circle: {
      position: 'absolute',
      top: size * 0.08333,
      left: '50%',
      transform: [{ translateX: -circleRadius }],
      width: circleRadius * 2,
      height: circleRadius * 2,
      borderRadius: circleRadius,
      overflow: 'hidden',
    },
  });

  return (
    <View style={style.container}>
      <LocationPin width={size} height={size} fill={pinColor} />
      <View style={[style.circle, { backgroundColor: circleBgColor }]}>{circleIcon}</View>
    </View>
  );
}
