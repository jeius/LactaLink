import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '../ui/box';
import LoadingSpinner from './LoadingSpinner';

export default function FetchingSpinner({ isFetching = true }: { isFetching?: boolean }) {
  if (isFetching) {
    return (
      <Box style={{ ...StyleSheet.absoluteFillObject, zIndex: 10 }}>
        <Box style={StyleSheet.absoluteFill} className="bg-background-100 opacity-70" />
        <LoadingSpinner isLoading={isFetching} className="bg-transparent" />
      </Box>
    );
  }
  return null;
}
