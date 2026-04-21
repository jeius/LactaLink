import TruncatedText from '@/components/TruncatedText';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Select } from '@/components/ui/sheet';
import { VStack } from '@/components/ui/vstack';
import { SheetDetent } from '@lodev09/react-native-true-sheet';
import { PlusCircleIcon } from 'lucide-react-native';
import { ReactNode, useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FIELD_OPTIONS } from '../../lib/constants';
import { BlockSchema, BlockType } from '../../lib/types';

interface SelectFieldsSheetProps {
  onSelect?: (field: BlockSchema) => void;
  trigger?: ReactNode;
}

export default function SelectFieldsSheet({ onSelect, trigger }: SelectFieldsSheetProps) {
  const detents = useDetents(FIELD_OPTIONS.length);

  const handleSelect = useCallback(
    (value: BlockType | undefined | null) => {
      if (!value) return;

      switch (value) {
        case 'select':
        case 'multi-select':
        case 'radio':
          onSelect?.({ blockType: value, options: [] } as unknown as BlockSchema);
          break;
        default:
          onSelect?.({ blockType: value } as BlockSchema);
          break;
      }
    },
    [onSelect]
  );

  return (
    <Select onSelect={handleSelect} disableHighlight>
      <Select.Trigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" size="sm">
            <ButtonIcon as={PlusCircleIcon} />
            <ButtonText>Add Field</ButtonText>
          </Button>
        )}
      </Select.Trigger>

      <Select.Content scrollable detents={detents}>
        <Heading size="lg" className="px-4 pb-2">
          Choose a field type
        </Heading>

        <Select.FlashList
          data={FIELD_OPTIONS}
          keyExtractor={(item) => item.value}
          nestedScrollEnabled
          renderItem={({ item }) => (
            <Select.Item recyclingKey={item.value} value={item.value} className="items-stretch">
              <Box className="items-center justify-center pr-3">
                <Select.Icon as={item.icon} size="2xl" />
              </Box>

              <VStack space="xs" className="flex-1">
                <Select.Text className="font-JakartaMedium">{item.label}</Select.Text>
                <TruncatedText
                  size="sm"
                  initialLines={2}
                  recyclingKey={item.value}
                  className="text-typography-600"
                >
                  {item.description}
                </TruncatedText>
              </VStack>
            </Select.Item>
          )}
        />
      </Select.Content>
    </Select>
  );
}

function useDetents(itemsLength: number, itemSize = 64) {
  const screen = useWindowDimensions();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const detents = useMemo<SheetDetent[]>(() => {
    const calculatedDetent = (itemsLength * itemSize + bottomInset + 30) / screen.height;
    return [Math.min(0.6, calculatedDetent)];
  }, [bottomInset, itemsLength, screen.height, itemSize]);
  return detents;
}
