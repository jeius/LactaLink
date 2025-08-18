import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

import { useMeUser } from '@/hooks/auth/useAuth';

import { DonationSchema } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities';
import { randomUUID } from 'expo-crypto';

import { AlertCircleIcon, MilkIcon, PlusIcon, TimerIcon, Trash2Icon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

interface MilkBagsFieldProps {
  isLoading?: boolean;
}

export default function MilkBagsField({ isLoading }: MilkBagsFieldProps) {
  const { data: user } = useMeUser();
  const profile = extractCollection(user?.profile?.value);

  const flatListRef = useRef<FlatList>(null);
  const prevLength = useRef(0);
  const [removedIndex, setRemovedIndex] = useState<number | null>(null);

  const { append, remove, fields } = useFieldArray<DonationSchema>({ name: 'details.bags' });
  const form = useFormContext<DonationSchema>();

  const { error } = form.getFieldState('details.bags');
  const disableRemove = fields.length < 2;

  const { width: deviceWidth } = useWindowDimensions();

  const itemWidth = deviceWidth - 40; // Width of each item
  const separatorWidth = 40; // Width of the separator

  useEffect(() => {
    if (prevLength.current === 0 && fields.length > 0) {
      // Scroll to the first item when the field array is initialized
      flatListRef.current?.scrollToIndex({ animated: false, index: 0 });
    } else if (prevLength.current < fields.length) {
      // Scroll to the last item when a new item is added
      flatListRef.current?.scrollToIndex({ animated: true, index: fields.length - 1 });
    } else if (prevLength.current > fields.length) {
      const indexToScroll =
        removedIndex !== null && removedIndex >= 0 ? Math.min(fields.length - 1, removedIndex) : 0;
      // Scroll to the previous item when an item is removed
      flatListRef.current?.scrollToIndex({ animated: true, index: indexToScroll });
    }
  }, [fields.length, removedIndex]);

  function handleAdd() {
    prevLength.current = fields.length;
    append({
      donor: profile!.id,
      collectedAt: new Date().toISOString(),
      volume: 20,
      quantity: 1,
      groupID: randomUUID(),
    });
  }

  function handleRemove(index: number) {
    if (fields.length < 2) return;
    prevLength.current = fields.length;
    remove(index);
    setRemovedIndex(index);
  }

  return (
    <FormControl isInvalid={!!error} className="w-full">
      <FormControlLabel className="mx-5">
        <FormControlLabelText>Milk Bags</FormControlLabelText>
      </FormControlLabel>

      <FormControlError className="mx-5 mb-2 w-full">
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{error?.root?.message || error?.message}</FormControlErrorText>
      </FormControlError>

      <FlatList
        ref={flatListRef}
        data={fields}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        renderItem={({ index }) => (
          <RenderCard
            index={index}
            isLoading={isLoading}
            onRemove={handleRemove}
            disableRemove={disableRemove}
            variant="filled"
            className={`relative ${error ? 'border-error-500' : ''}`}
            style={{ width: itemWidth }}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        ItemSeparatorComponent={() => <Box style={{ width: separatorWidth }} />}
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: (itemWidth + separatorWidth) * index,
          index,
        })}
      />

      <Button
        animateOnPress={false}
        size="sm"
        action="positive"
        variant="link"
        className="mx-auto"
        onPress={handleAdd}
      >
        <ButtonIcon as={PlusIcon} size="xl" />
        <ButtonText>Add Milk Bag</ButtonText>
      </Button>
    </FormControl>
  );
}

interface RenderCardProps extends React.ComponentProps<typeof Card> {
  index: number;
  onRemove: (index: number) => void;
  disableRemove?: boolean;
  isLoading?: boolean;
}
function RenderCard({
  index: i,
  onRemove: handleRemove,
  disableRemove,
  isLoading,
  ...cardProps
}: RenderCardProps) {
  return (
    <Card {...cardProps}>
      <VStack space="md">
        <HStack space="md">
          <FormField
            name={`details.bags.${i}.volume`}
            label="Volume (mL)"
            fieldType="number"
            placeholder="e.g. 20"
            keyboardType="numeric"
            inputIcon={MilkIcon}
            showStepButtons
            step={10}
            min={20}
            containerStyle={{ maxWidth: 160, width: '100%' }}
            helperText="Minimum 20 mL"
            isLoading={isLoading}
          />
          <FormField
            name={`details.bags.${i}.quantity`}
            label="Quantity"
            fieldType="number"
            placeholder="e.g. 2"
            keyboardType="numeric"
            showStepButtons
            step={1}
            min={1}
            containerStyle={{ maxWidth: 115, width: '100%' }}
            helperText="Minimum 1 bag"
            isLoading={isLoading}
          />
        </HStack>
        <VStack space="md">
          <FormField
            name={`details.bags.${i}.collectedAt`}
            label="Date collected"
            fieldType="date"
            mode="date"
            placeholder="Select date..."
            containerStyle={{ maxWidth: 180, width: '100%' }}
            isLoading={isLoading}
          />
          <FormField
            name={`details.bags.${i}.collectedAt`}
            label="Time collected"
            inputIcon={TimerIcon}
            placeholder="Select time..."
            fieldType="date"
            mode="time"
            showSetNowButton
            containerStyle={{ maxWidth: 180, width: '100%' }}
            isLoading={isLoading}
          />
        </VStack>
      </VStack>
      <Box className="absolute bottom-0 right-0">
        <Button
          isDisabled={isLoading || disableRemove}
          action="negative"
          variant="link"
          className="h-fit w-fit p-5"
          animateOnPress={false}
          onPress={() => {
            handleRemove(i);
          }}
        >
          <ButtonIcon as={Trash2Icon} size="xl" />
        </Button>
      </Box>
    </Card>
  );
}
