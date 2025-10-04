import { AnimatedPressable } from '@/components/animated/pressable';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Search } from '@lactalink/types/payload-generated-types';
import { XIcon } from 'lucide-react-native';
import React, { memo } from 'react';

type SearchItemProps = {
  item: Search;
  isSearchMode?: boolean;
  onPress?: (item: Search) => void;
  onRemove?: (id: string) => void;
};

/**
 * Renders a search item in the search results or history list
 */
export const SearchItem = memo(function SearchItem({
  item,
  isSearchMode = true,
  onPress,
  onRemove,
}: SearchItemProps) {
  const { title } = item;

  function handlePress() {
    onPress?.(item);
  }

  return (
    <AnimatedPressable
      disablePressAnimation
      className="flex-row items-center px-5 py-3"
      onPress={handlePress}
    >
      <Text className="flex-1" ellipsizeMode="tail" numberOfLines={1}>
        {title}
      </Text>
      {!isSearchMode && (
        <Button
          size="sm"
          variant="link"
          action="default"
          className="h-fit w-fit p-0"
          onPress={() => onRemove?.(item.id)}
        >
          <ButtonIcon as={XIcon} />
        </Button>
      )}
    </AnimatedPressable>
  );
});
