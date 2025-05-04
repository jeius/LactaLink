import React from 'react';
import { Box } from '../ui/box';
import { Text } from '../ui/text';

export interface FormMessageProps {
  status?: 'success' | 'error';
  message?: string;
}
export default function FormMessage({ status, message }: FormMessageProps) {
  return message && status === 'success' ? (
    <Box className="bg-success-200 rounded-xl p-4">
      <Text className="text-success-800 text-center">{message}</Text>
    </Box>
  ) : status === 'error' ? (
    <Box className="bg-error-200 rounded-xl p-4">
      <Text className="text-error-800 text-center">{message}</Text>
    </Box>
  ) : null;
}
