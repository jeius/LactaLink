import { DraggableWrapper, DraggableWrapperRef } from '@/components/DraggableWrapper';
import { FormField } from '@/components/FormField';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { CreateDonationSchema } from '@lactalink/types';
import { Motion } from '@legendapp/motion';
import { MilkIcon, PlusCircleIcon, TimerIcon, Trash2Icon } from 'lucide-react-native';
import React, { createRef, useEffect, useRef } from 'react';
import { useFieldArray } from 'react-hook-form';

export default function MilkBagsField() {
  const { profile } = useAuth();
  const draggableRefs = useRef<DraggableWrapperRef[]>([]);

  const { append, remove, fields } = useFieldArray<CreateDonationSchema>({ name: 'details.bags' });

  function addMilkBag() {
    append({ donor: profile!.id, collectedAt: new Date().toISOString(), volume: 20, quantity: 1 });
  }

  useEffect(() => {
    draggableRefs.current = fields.map(
      (_, i) => draggableRefs.current[i] ?? createRef<DraggableWrapperRef>().current!
    );
  }, [fields]);

  return (
    <VStack space="md">
      <Text size="md" className="font-JakartaMedium">
        Milk Bags
      </Text>
      {fields.map((field, i) => {
        const disableRemove = fields.length < 2;
        return (
          <DraggableWrapper
            disabled
            key={field.id}
            ref={(ref) => {
              draggableRefs.current[i] = ref!;
            }}
            onDismiss={() => remove(i)}
            dismissDistanceMultiplier={0.4}
          >
            <Motion.View initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card variant="outline" size="lg" className="flex-1 p-3">
                <HStack space="md" className="items-end">
                  <VStack space="md" className="flex-1">
                    <HStack space="md" className="flex-wrap">
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
                        containerClassName="w-full max-w-[160px]"
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
                        containerClassName="w-full max-w-[120px]"
                      />
                    </HStack>
                    <HStack space="md" className="flex-wrap">
                      <FormField
                        name={`details.bags.${i}.collectedAt`}
                        label="Date collected"
                        fieldType="date"
                        mode="date"
                        placeholder="Select date..."
                        containerClassName="w-full max-w-[180px]"
                      />
                      <FormField
                        name={`details.bags.${i}.collectedAt`}
                        label="Time collected"
                        inputIcon={TimerIcon}
                        placeholder="Select time..."
                        fieldType="date"
                        mode="time"
                        showSetNowButton
                        containerClassName="w-full max-w-[180px]"
                      />
                    </HStack>
                  </VStack>
                  <Button
                    isDisabled={disableRemove}
                    action="negative"
                    variant="link"
                    className="h-fit w-fit p-4"
                    onPress={() => {
                      draggableRefs.current[i]?.dismiss();
                    }}
                  >
                    <ButtonIcon as={Trash2Icon} size="xl" />
                  </Button>
                </HStack>
              </Card>
            </Motion.View>
          </DraggableWrapper>
        );
      })}
      <Button size="sm" action="positive" variant="link" className="mx-auto" onPress={addMilkBag}>
        <ButtonIcon as={PlusCircleIcon} size="xl" />
        <ButtonText>Add Milk Bag</ButtonText>
      </Button>
    </VStack>
  );
}
