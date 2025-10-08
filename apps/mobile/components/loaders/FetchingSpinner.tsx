import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '../ui/box';
import LoadingSpinner from './LoadingSpinner';

export default function FetchingSpinner({ isFetching = true }: { isFetching?: boolean }) {
  if (isFetching) {
    return (
      <>
        <Box style={StyleSheet.absoluteFill} className="bg-background-100 opacity-70" />
        <LoadingSpinner isLoading={isFetching} className="bg-transparent" />
      </>
    );
  }
  return null;
}
