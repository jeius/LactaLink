import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function GradientBackground(props: LinearGradientProps) {
  return <LinearGradient {...props} style={styles.background} />;
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
