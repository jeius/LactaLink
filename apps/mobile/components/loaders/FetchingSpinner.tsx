import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '../ui/box';
import LoadingSpinner from './LoadingSpinner';

export default function FetchingSpinner({ isFetching = true }: { isFetching?: boolean }) {
  if (!isFetching) return null;
  return (
    <Box style={{ ...StyleSheet.absoluteFillObject, zIndex: 10 }}>
      <Box style={[StyleSheet.absoluteFill, { opacity: 0.75 }]} className="bg-background-100" />
      <LoadingSpinner isLoading={isFetching} className="bg-transparent" />
    </Box>
  );
}
