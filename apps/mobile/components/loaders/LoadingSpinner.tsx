import React from 'react';
import SafeArea from '../SafeArea';
import { Spinner } from '../ui/spinner';

export default function LoadingSpinner({ isLoading = true }: { isLoading?: boolean }) {
  if (isLoading) {
    return (
      <SafeArea className="items-center justify-center">
        <Spinner size={'large'} />
      </SafeArea>
    );
  }

  return null;
}
