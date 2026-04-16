import TruncatedText from '@/components/TruncatedText';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Select } from '@/components/ui/sheet';
import { VStack } from '@/components/ui/vstack';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import { SheetDetent } from '@lodev09/react-native-true-sheet';
import {
  BinaryIcon,
  Calendar1Icon,
  CaseSensitiveIcon,
  CheckSquareIcon,
  CircleDotIcon,
  ListChecksIcon,
  ListIcon,
  LucideIcon,
  MailIcon,
  PlusCircleIcon,
} from 'lucide-react-native';
import { ReactNode, useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FieldSchema = Exclude<DonorScreeningFormField, { blockType: 'message' }>;

type BlockType = FieldSchema['blockType'];

type FieldOption = {
  label: string;
  value: BlockType;
  description: string;
  icon: LucideIcon;
};

const FIELD_OPTIONS: FieldOption[] = [
  {
    label: 'Text',
    value: 'text',
    icon: CaseSensitiveIcon,
    description: 'A simple text input field for short answers.',
  },
  {
    label: 'Textarea',
    value: 'textarea',
    icon: CaseSensitiveIcon,
    description: 'A larger text input field for longer answers.',
  },
  {
    label: 'Select',
    value: 'select',
    icon: ListIcon,
    description: 'A dropdown field that allows users to select one option from a list.',
  },
  {
    label: 'Multi Select',
    value: 'multi-select',
    icon: ListChecksIcon,
    description: 'A dropdown field that allows users to select multiple options from a list.',
  },
  {
    label: 'Checkbox',
    value: 'checkbox',
    icon: CheckSquareIcon,
    description: 'A field that allows users to agree/disagree by checking boxes.',
  },
  {
    label: 'Radio',
    value: 'radio',
    icon: CircleDotIcon,
    description:
      'A field that allows users to select one option from a list by tapping on a circle.',
  },
  {
    label: 'Date',
    value: 'date',
    icon: Calendar1Icon,
    description: 'A field that allows users to select a date from a calendar.',
  },
  {
    label: 'Email',
    value: 'email',
    icon: MailIcon,
    description: 'A field that allows users to enter an email address and validates the format.',
  },
  {
    label: 'Number',
    value: 'number',
    icon: BinaryIcon,
    description: 'A field that allows users to enter a number and validates the input.',
  },
];

interface SelectFieldsSheetProps {
  onSelect?: (field: FieldSchema) => void;
  trigger?: ReactNode;
}

export default function SelectFieldsSheet({ onSelect, trigger }: SelectFieldsSheetProps) {
  const detents = useDetents(FIELD_OPTIONS.length);

  const handleSelect = useCallback(
    (value: BlockType | undefined | null) => {
      if (!value) return;

      const baseFields = { label: '', name: '' };

      switch (value) {
        case 'select':
        case 'multi-select':
        case 'radio':
          onSelect?.({ blockType: value, ...baseFields, options: [] });
          break;
        default:
          onSelect?.({ blockType: value, ...baseFields });
          break;
      }
    },
    [onSelect]
  );

  return (
    <>
      <Select onSelect={handleSelect}>
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
          <Select.FlashList
            data={FIELD_OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Select.Item recyclingKey={item.value} value={item.value} className="items-stretch">
                <Box className="items-center justify-center pr-2">
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
    </>
  );
}

function useDetents(itemsLength: number, itemSize = 64) {
  const screen = useWindowDimensions();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const detents = useMemo<SheetDetent[]>(() => {
    const calculatedDetent = (itemsLength * itemSize + bottomInset + 30) / screen.height;
    return [Math.min(0.5, calculatedDetent), 1];
  }, [bottomInset, itemsLength, screen.height, itemSize]);
  return detents;
}
