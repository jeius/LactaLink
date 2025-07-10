import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { getHexColor } from '@/lib/colors';
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function GradientBackground(props: LinearGradientProps) {
  return <LinearGradient {...props} style={[props.style, StyleSheet.absoluteFill]} />;
}

export function ImageGradientOverlay(props: Partial<LinearGradientProps>) {
  const { theme } = useTheme();
  const endColor = getHexColor(theme, 'background', 0) || theme === 'dark' ? '#fff' : '#fff';
  return (
    <LinearGradient
      {...props}
      style={[props.style, StyleSheet.absoluteFill, { opacity: 0.75 }]}
      colors={props.colors || ['transparent', endColor]}
    />
  );
}
