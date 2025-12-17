import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
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
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { DonationSchema, MilkBagCreateSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { useMutation } from '@tanstack/react-query';
import { produce } from 'immer';
import { AlertCircleIcon, MilkIcon, PlusIcon } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { ViewProps } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { createMilkBag } from '../../../../lib/api/create';
import { addMilkBagToCache } from '../../../../lib/cacheUtils/milkbags';
import MilkBagActionSheet from '../../../MilkBagActionSheet';
import ListItem from './ListItem';

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
