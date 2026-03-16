import { getColor } from '@/lib/colors';
import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient, { type LinearGradientProps } from '../LinearGradient';

export default function GradientBackground(props: LinearGradientProps) {
  return <LinearGradient {...props} style={[props.style, StyleSheet.absoluteFillObject]} />;
}

export function ImageGradientOverlay(props: Partial<LinearGradientProps>) {
  const endColor = getColor('background', '0');
  return (
    <LinearGradient
      {...props}
      style={[props.style, StyleSheet.absoluteFill, { opacity: 0.75 }]}
      colors={props.colors || ['transparent', endColor]}
    />
  );
}
