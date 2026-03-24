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
import { useAddMilkBagMutation } from '@/features/donation&request/hooks/mutations';
import { DonationSchema } from '@lactalink/form-schemas';
import { AlertCircleIcon, MilkIcon, PlusIcon } from 'lucide-react-native';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { ViewProps } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import MilkBagFormSheet from './MilkBagFormSheet';
import MilkBagItem from './MilkBagItem';

const AnimatedButton = Animated.createAnimatedComponent(Button);

interface CreateMilkBagsFieldProps extends Pick<ViewProps, 'style' | 'className'> {
  isLoading?: boolean;
  isDisabled?: boolean;
}

export default function MilkBagsField({
  isLoading,
  isDisabled,
  ...props
}: CreateMilkBagsFieldProps) {
  const { control } = useFormContext<DonationSchema>();

  const {
    field: { value: milkbags, onChange },
    fieldState: { error, invalid },
  } = useController({ name: 'details.bags', control });

  const { mutate: addMilkBag } = useAddMilkBagMutation(milkbags, onChange);

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
          <MilkBagItem
            key={`milkbag-${index}-${bag.id}`}
            value={bag}
            isLoading={isLoading}
            isDisabled={isDisabled}
            onDuplicate={addMilkBag}
            disableRemove={milkbags.length <= 1}
          />
        ))}
      </VStack>

      <MilkBagFormSheet
        trigger={(props) => (
          <AnimatedButton
            {...props}
            layout={LinearTransition}
            isDisabled={isDisabled}
            size="sm"
            variant="outline"
            action="positive"
            className="mt-5"
          >
            <ButtonIcon as={PlusIcon} />
            <ButtonText>Add Milk Bag</ButtonText>
          </AnimatedButton>
        )}
      />
    </FormControl>
  );
}
