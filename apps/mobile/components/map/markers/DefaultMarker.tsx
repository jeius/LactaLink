import { useTheme } from '@/components/AppProvider/ThemeProvider';
import LocationPin from '@/components/icons/LocationPin';
import { getHexColor } from '@/lib/colors';
import { ReactNode } from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

interface DefaultMarkerProps {
  size?: number;
  color?: ColorValue | string;
  circleColor?: ColorValue | string;
  circleIcon?: ReactNode;
}

export function DefaultMarker({ size = 48, color, circleColor, circleIcon }: DefaultMarkerProps) {
  const { theme } = useTheme();

  const pinColor = color || getHexColor(theme, 'primary', 500);
  const circleBgColor = circleColor || getHexColor(theme, 'primary', 100);

  const circleRadius = size * 0.25; // 25% of the marker size;

  const style = StyleSheet.create({
    container: { position: 'relative', width: size, height: size },
    circle: {
      position: 'absolute',
      top: 4,
      left: '50%',
      transform: [{ translateX: -circleRadius }],
      width: circleRadius * 2,
      height: circleRadius * 2,
      borderRadius: circleRadius,
    },
  });

  return (
    <View style={style.container}>
      <LocationPin width={size} height={size} fill={pinColor} />
      <View style={[style.circle, { backgroundColor: circleBgColor }]}>{circleIcon}</View>
    </View>
  );
}
