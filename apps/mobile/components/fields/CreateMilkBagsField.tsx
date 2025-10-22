import { useMeUser } from '@/hooks/auth/useAuth';
import { deleteMilkBag } from '@/lib/api/delete';
import { getPrimaryColor } from '@/lib/colors';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMilkBagSchema, DonationSchema, MilkBagCreateSchema } from '@lactalink/form-schemas';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { useMutation } from '@tanstack/react-query';
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  CopyIcon,
  MilkIcon,
  MinusIcon,
  PlusIcon,
  TimerIcon,
} from 'lucide-react-native';
import React, { ComponentProps, useState } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import { ViewProps } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutRight,
  LinearTransition,
  useAnimatedRef,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { AnimatedPressable } from '../animated/pressable';
import { FormField } from '../FormField';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '../ui/actionsheet';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '../ui/form-control';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { MilkBottleIcon } from '../ui/icon/custom';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

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

  const { control, getValues, getFieldState } = useFormContext<DonationSchema>();
  const { error } = getFieldState('details.bags');

  const { fields, append, remove, insert } = useFieldArray({
    name: 'details.bags',
    keyName: 'fieldID',
    control,
  });

  const { mutateAsync: handleRemove } = useMutation({
    mutationFn: async ({ id }: { index: number; id?: string }) => {
      if (id) await deleteMilkBag(id);
    },
    onMutate: ({ index }) => {
      const prevSnapshot = getValues(`details.bags.${index}`);
      remove(index);
      return { prevSnapshot };
    },
    onError: (error, { index }, ctx) => {
      toast.error('Failed to remove milk bag. ' + extractErrorMessage(error));
      if (ctx?.prevSnapshot) {
        insert(index, ctx.prevSnapshot);
      }
    },
  });

  return (
    <FormControl isInvalid={!!error} {...props}>
      <FormControlLabel>
        <FormControlLabelText size="lg" className="font-JakartaSemiBold">
          Milk Bags
        </FormControlLabelText>
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
        {fields.map(({ fieldID }, index) => (
          <ListItem
            key={fieldID}
            index={index}
            isLoading={isLoading}
            isDisabled={isDisabled}
            onRemove={handleRemove}
            onDuplicate={append}
            disableRemove={fields.length <= 1}
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

      <FormActionSheet isOpen={open} onClose={() => setOpen(false)} onSave={append} />
    </FormControl>
  );
}

interface ListItemProps {
  index: number;
  isLoading?: boolean;
  isDisabled?: boolean;
  onRemove?: (val: { index: number; id: string | undefined }) => void;
  onDuplicate?: (data: MilkBagCreateSchema) => void;
  disableRemove?: boolean;
}

function ListItem({
  index,
  onRemove,
  disableRemove,
  onDuplicate,
  isLoading,
  isDisabled,
}: ListItemProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useAnimatedRef<Animated.View>();

  const { setValue, control } = useFormContext<DonationSchema>();
  const data = useWatch({ control, name: `details.bags.${index}` });
  const { collectedAt, volume } = data;

  function handleRemove() {
    onRemove?.({ index, id: data.id });
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleDuplicate() {
    onDuplicate?.({ collectedAt, volume, donor: data.donor });
  }

  function handleSave(updatedData: MilkBagCreateSchema) {
    setValue(`details.bags.${index}`, updatedData, { shouldDirty: true, shouldTouch: true });
    setOpen(false);
  }

  return (
    <Animated.View
      ref={containerRef}
      layout={LinearTransition}
      className="flex-row items-center gap-2"
    >
      <Animated.View entering={FadeIn}>
        <Button
          size="sm"
          action="negative"
          className="h-fit w-fit rounded-full p-2"
          onPress={handleRemove}
          isDisabled={isDisabled || disableRemove}
        >
          <ButtonIcon as={MinusIcon} />
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
                  <Box className="bg-primary-50 h-12 w-12 shrink-0 items-center justify-center rounded-md">
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

      <FormActionSheet isOpen={open} onClose={handleClose} onSave={handleSave} values={data} />
    </Animated.View>
  );
}

interface FormActionSheetProps extends ComponentProps<typeof Actionsheet> {
  values?: MilkBagCreateSchema;
  onSave?: (data: MilkBagCreateSchema) => void;
}

function FormActionSheet({ values, ...props }: FormActionSheetProps) {
  const insets = useSafeAreaInsets();
  const { data: meUser } = useMeUser();
  const profileID = extractID(meUser?.profile?.value);

  const methods = useForm({
    resolver: zodResolver(createMilkBagSchema),
    values: values,
    defaultValues: {
      volume: 0,
      collectedAt: new Date().toISOString(),
      donor: profileID,
    },
  });

  function handleConfirm() {
    methods.handleSubmit((data) => {
      props.onSave?.(data);
      props.onClose?.();
    })();
  }

  return (
    <Actionsheet {...props}>
      <ActionsheetBackdrop />
      <ActionsheetContent
        className="items-stretch gap-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <FormProvider {...methods}>
          <FormField
            name={`volume`}
            control={methods.control}
            label="Volume (mL)"
            fieldType="number"
            placeholder="e.g. 20"
            keyboardType="numeric"
            inputIcon={MilkIcon}
            showStepButtons
            step={10}
            min={20}
            helperText="Minimum 20 mL"
          />
          <FormField
            name={`collectedAt`}
            control={methods.control}
            label="Date collected"
            fieldType="date"
            mode="date"
            placeholder="Select date..."
          />
          <FormField
            name={`collectedAt`}
            control={methods.control}
            label="Time collected"
            inputIcon={TimerIcon}
            placeholder="Select time..."
            fieldType="date"
            mode="time"
            showSetNowButton
          />
        </FormProvider>

        <Button className="mt-4" onPress={handleConfirm}>
          <ButtonText>Confirm</ButtonText>
        </Button>
      </ActionsheetContent>
    </Actionsheet>
  );
}
