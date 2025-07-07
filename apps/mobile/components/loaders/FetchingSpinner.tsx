import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '../ui/box';
import { Spinner } from '../ui/spinner';
import { VStack } from '../ui/vstack';

export default function FetchingSpinner({ isFetching = true }: { isFetching?: boolean }) {
  if (isFetching) {
    return (
      <VStack style={StyleSheet.absoluteFill} className="items-center justify-center">
        <Box style={StyleSheet.absoluteFill} className="bg-background-100 opacity-70" />
        <Spinner size="large" />
      </VStack>
    );
  }
  return null;
}
