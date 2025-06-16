import { FormField } from '@/components/FormField';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { useAuth } from '@/hooks/auth/useAuth';

import { CreateDonationSchema } from '@lactalink/types';

import { MilkIcon, PlusCircleIcon, TimerIcon, Trash2Icon } from 'lucide-react-native';
import React, { useRef } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Dimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const DEVICE_WIDTH = Dimensions.get('window').width;

export default function MilkBagsField() {
  const { profile } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const { append, remove, fields } = useFieldArray<CreateDonationSchema>({ name: 'details.bags' });
  const disableRemove = fields.length < 2;

  function handleAdd() {
    append({ donor: profile!.id, collectedAt: new Date().toISOString(), volume: 20, quantity: 1 });
    // Scroll to the end of the list after adding a new item
    // Delaying the scroll to ensure the new item is rendered
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ animated: true, index: fields.length });
    }, 200);
  }

  function handleRemove(index: number) {
    if (fields.length < 2) return;
    flatListRef.current?.scrollToIndex({ animated: true, index: Math.max(0, index - 1) });
    // Delay the removal to allow the scroll animation to complete
    // This is a workaround to avoid the list jumping back to the first item
    setTimeout(() => {
      remove(index);
    }, 50);
  }

  return (
    <VStack>
      <Text size="md" className="font-JakartaMedium mx-5 mb-1">
        Milk Bags
      </Text>
      <FlatList
        ref={flatListRef}
        data={fields}
        keyExtractor={(item) => item.id}
        horizontal
        renderItem={({ index }) => (
          <RenderCard index={index} onRemove={handleRemove} disableRemove={disableRemove} />
        )}
        contentContainerStyle={{ paddingRight: 20 }}
        getItemLayout={(_, index) => ({
          length: DEVICE_WIDTH - 40, // Width of each item
          offset: (DEVICE_WIDTH - 40 + 20) * index, // Item width + marginLeft (20)
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
        <ButtonIcon as={PlusCircleIcon} size="xl" />
        <ButtonText>Add Milk Bag</ButtonText>
      </Button>
    </VStack>
  );
}

type RenderCardProps = {
  index: number;
  onRemove: (index: number) => void;
  disableRemove?: boolean;
};
function RenderCard({ index: i, onRemove: handleRemove, disableRemove }: RenderCardProps) {
  return (
    <Card
      className="relative"
      style={{ width: DEVICE_WIDTH - 40, marginBottom: 16, marginLeft: 20 }}
    >
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
          />
        </VStack>
      </VStack>
      <Box className="absolute bottom-0 right-0">
        <Button
          isDisabled={disableRemove}
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
