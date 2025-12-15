import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { MilkBottleIcon } from '@/components/ui/icon/custom';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { deleteMilkBag } from '@/lib/api/delete';
import { getPrimaryColor } from '@/lib/colors';
import { createTempID, isTempID } from '@/lib/utils/tempID';
import { DonationSchema, MilkBagCreateSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { useMutation } from '@tanstack/react-query';
import { produce } from 'immer';
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  CopyIcon,
  MilkIcon,
  MinusIcon,
  PlusIcon,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { ViewProps } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutRight,
  LinearTransition,
  useAnimatedRef,
} from 'react-native-reanimated';
import { createMilkBag } from '../lib/api/create';
import { updateMilkBag } from '../lib/api/update';
import {
  addMilkBagToCache,
  removeMilkBagFromCache,
  updateMilkBagInCache,
} from '../lib/cacheUtils/milkbags';
import MilkBagActionSheet from './MilkBagActionSheet';

const AnimatedButton = Animated.createAnimatedComponent(Button);

interface CreateMilkBagsFieldProps extends Pick<ViewProps, 'style' | 'className'> {
  isLoading?: boolean;
  isDisabled?: boolean;
}

export default function CreateMilkBagsField({
  isLoading,
  isDisabled,
  ...props
}: CreateMilkBagsFieldProps) {
  const [open, setOpen] = useState(false);

  const { control } = useFormContext<DonationSchema>();

  const {
    field: { value: milkbags, onChange },
    fieldState: { error, invalid },
  } = useController({ name: 'details.bags', control });

  const { mutate: addMilkBag } = useMutation({
    meta: { errorMessage: (error) => 'Failed to add milk bag. ' + extractErrorMessage(error) },
    mutationFn: createMilkBag,
    onMutate: (data) => {
      const prevSnapshot = milkbags;
      onChange([...milkbags, data]);
      return { prevSnapshot };
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.prevSnapshot) onChange(ctx.prevSnapshot);
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      addMilkBagToCache(client, data);
    },
  });

  const handleEditMilkBag = useCallback(
    ({ index, ...data }: MilkBagCreateSchema & { index: number }) => {
      onChange(
        produce(milkbags, (draft) => {
          if (draft[index]) draft[index] = data;
        })
      );
    },
    [milkbags, onChange]
  );

  return (
    <FormControl isInvalid={invalid} {...props}>
      <FormControlLabel>
        <FormControlLabelText size="lg" className="flex-1 font-JakartaSemiBold">
          Milk Bags
        </FormControlLabelText>
        <Icon as={MilkIcon} />
      </FormControlLabel>

      <FormControlHelper>
        <FormControlHelperText>You can add multiple milk bags.</FormControlHelperText>
      </FormControlHelper>

      {error && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{error.message}</FormControlErrorText>
        </FormControlError>
      )}

      <VStack space="sm" className="mt-2 items-stretch">
        {milkbags.map((bag, index) => (
          <ListItem
            key={index}
            index={index}
            value={bag}
            isLoading={isLoading}
            isDisabled={isDisabled}
            onDuplicate={addMilkBag}
            onChange={handleEditMilkBag}
            disableRemove={milkbags.length <= 1}
          />
        ))}
      </VStack>

      <AnimatedButton
        layout={LinearTransition}
        isDisabled={isDisabled}
        size="sm"
        variant="outline"
        action="positive"
        className="mt-5"
        onPress={() => setOpen(true)}
      >
        <ButtonIcon as={PlusIcon} />
        <ButtonText>Add Milk Bag</ButtonText>
      </AnimatedButton>

      <MilkBagActionSheet isOpen={open} onClose={() => setOpen(false)} onSave={addMilkBag} />
    </FormControl>
  );
}

interface ListItemProps {
  index: number;
  isLoading?: boolean;
  isDisabled?: boolean;
  onDuplicate?: (data: MilkBagCreateSchema) => void;
  value: MilkBagCreateSchema;
  onChange?: (data: MilkBagCreateSchema & { index: number }) => void;
  disableRemove?: boolean;
}

function ListItem({
  index,
  disableRemove,
  onDuplicate,
  isLoading,
  isDisabled,
  value: data,
  onChange,
}: ListItemProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useAnimatedRef<Animated.View>();

  const { collectedAt, volume, id } = data;
  const isTemp = isTempID(id);

  const { mutateAsync: handleRemove, isPending: isDeleting } = useMutation({
    meta: { errorMessage: (error) => 'Failed to remove milk bag. ' + extractErrorMessage(error) },
    mutationKey: ['milkBags', 'delete', id],
    mutationFn: () => {
      if (isTemp) return Promise.resolve(null);
      return deleteMilkBag(id);
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      if (data) removeMilkBagFromCache(client, data.id);
    },
  });

  const { mutate: editMilkBag, isPending: isUpdating } = useMutation({
    meta: { errorMessage: (error) => 'Failed to edit milk bag. ' + extractErrorMessage(error) },
    mutationFn: updateMilkBag,
    onMutate: (newData) => {
      const prevSnapshot = data;
      onChange?.({ ...newData, index });
      return { prevSnapshot };
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.prevSnapshot) onChange?.({ ...ctx.prevSnapshot, index });
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      if (data) updateMilkBagInCache(client, data);
    },
  });

  const isPending = isUpdating || isDeleting;

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleDuplicate() {
    onDuplicate?.({ collectedAt, volume, donor: data.donor, id: createTempID() });
  }

  function handleSave(updatedData: MilkBagCreateSchema) {
    editMilkBag(updatedData);
    setOpen(false);
  }

  return (
    <Animated.View
      ref={containerRef}
      layout={LinearTransition}
      className="flex-row items-center gap-2"
      pointerEvents={isTemp || isPending ? 'none' : 'auto'}
      style={{ opacity: isTemp || isPending ? 0.6 : 1 }}
    >
      <Animated.View entering={FadeIn}>
        <Button
          size="sm"
          action="negative"
          className="h-fit w-fit rounded-full p-2"
          onPress={() => handleRemove()}
          isDisabled={isDisabled || disableRemove}
        >
          {isPending ? <ButtonSpinner /> : <ButtonIcon as={MinusIcon} />}
        </Button>
      </Animated.View>

      <AnimatedPressable
        entering={FadeInDown}
        exiting={FadeOutRight}
        disablePressAnimation
        className="flex-1"
        onPress={handleOpen}
        disabled={isDisabled}
      >
        <Card size="lg" variant="filled" className="relative flex-1 overflow-visible p-4">
          <HStack space="lg" className="items-start">
            <HStack space="sm" className="flex-1 items-stretch justify-stretch">
              {isLoading ? (
                <>
                  <Skeleton className="h-12 w-12" />
                  <VStack space="xs" className="flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-full" />
                  </VStack>
                </>
              ) : (
                <>
                  <Box className="h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary-50">
                    <Icon as={MilkBottleIcon} size="2xl" color={getPrimaryColor('600')} />
                  </Box>
                  <VStack>
                    <HStack space="xs" className="items-center">
                      <Text className="font-JakartaSemiBold">{volume}mL</Text>
                    </HStack>
                    <HStack space="xs" className="items-center">
                      <Icon size="sm" as={CalendarDaysIcon} />
                      <Text size="sm" className="font-JakartaSemiBold">
                        {formatLocaleTime(collectedAt)},{' '}
                        {formatDate(collectedAt, { shortMonth: true })}
                      </Text>
                    </HStack>
                  </VStack>
                </>
              )}
            </HStack>
            <Button
              variant="link"
              action="default"
              className="h-fit w-fit p-0"
              isDisabled={isDisabled}
              hitSlop={8}
              onPress={handleDuplicate}
            >
              <ButtonIcon as={CopyIcon} />
            </Button>
          </HStack>
        </Card>
      </AnimatedPressable>

      <MilkBagActionSheet isOpen={open} onClose={handleClose} onSave={handleSave} values={data} />
    </Animated.View>
  );
}
