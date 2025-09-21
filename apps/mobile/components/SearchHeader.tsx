import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { Search } from '@lactalink/types/payload-generated-types';
import React, { memo } from 'react';

type SearchHeaderProps = {
  isSearchMode?: boolean;
  isLoading?: boolean;
  history?: Search[] | null;
  onClearHistory?: () => void;
};

/**
 * Header component for the search results or history list
 */
export const SearchHeader = memo(function SearchHeader({
  isSearchMode = true,
  isLoading,
  history,
  onClearHistory,
}: SearchHeaderProps) {
  if (isSearchMode) {
    if (isLoading) {
      return <Spinner className="mt-5" size={'large'} />;
    }
    return null;
  } else if (history?.length) {
    return (
      <HStack className="items-center justify-between px-5 pt-2">
        <Text bold size="md">
          Recent Searches
        </Text>
        <Button size="sm" variant="link" action="default" className="px-0" onPress={onClearHistory}>
          <ButtonText>Clear All</ButtonText>
        </Button>
      </HStack>
    );
  }
  return null;
});
