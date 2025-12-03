import { AnimatedPressable } from '@/components/animated/pressable';
import { ProfileAvatar } from '@/components/Avatar';
import { Button, ButtonIcon } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { UserSearch as Search } from '@lactalink/types/payload-generated-types';
import { XIcon } from 'lucide-react-native';
import React from 'react';

type SearchItemProps = {
  item: Search;
  isSearchMode?: boolean;
  onPress?: (item: Search) => void;
  onRemove?: (id: string) => void;
};

/**
 * Renders a search item in the search results or history list
 */
export default function SearchItem({
  item,
  isSearchMode = true,
  onPress,
  onRemove,
}: SearchItemProps) {
  const { title, doc } = item;

  function handlePress() {
    onPress?.(item);
  }

  return (
    <AnimatedPressable
      disablePressAnimation
      className="flex-row items-center px-5 py-3"
      onPress={handlePress}
    >
      <HStack space="sm" className="flex-1 items-center">
        <ProfileAvatar profile={doc} className="h-10 w-10" />
        <Text className="shrink font-JakartaMedium" ellipsizeMode="tail" numberOfLines={1}>
          {title}
        </Text>
      </HStack>
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
}
