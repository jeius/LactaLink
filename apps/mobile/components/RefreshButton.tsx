import { RefreshCwIcon } from 'lucide-react-native';
import React from 'react';
import { RotatingView } from './animated/RotatingView';
import { Button, ButtonIcon } from './ui/button';

interface RefreshButtonProps {
  refreshing: boolean;
  onRefresh: () => void;
}
export function RefreshButton({ refreshing, onRefresh }: RefreshButtonProps) {
  return (
    <RotatingView enable={refreshing}>
      <Button
        isDisabled={refreshing}
        variant="link"
        onPress={onRefresh}
        action="default"
        className="h-fit w-fit"
        size="sm"
        hitSlop={10}
      >
        <ButtonIcon as={RefreshCwIcon} />
      </Button>
    </RotatingView>
  );
}
