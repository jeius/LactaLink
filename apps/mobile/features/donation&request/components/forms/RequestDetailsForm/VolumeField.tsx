import ButtonGroupField from '@/components/form-fields/ButtonGroupField';
import { NumberInputField } from '@/components/form-fields/NumberInputField';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { VOLUME_PRESET } from '@/lib/constants/donationRequest';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { RequestCreateSchema } from '@lactalink/form-schemas';
import { useState } from 'react';
import { Control } from 'react-hook-form';

const buttonStyle = tva({
  base: '',
  variants: {
    isToggled: { true: 'bg-primary-500' },
  },
});

const buttonTextStyle = tva({
  base: '',
  variants: {
    isToggled: { true: 'text-primary-0' },
  },
});

interface VolumeFieldProps {
  control: Control<RequestCreateSchema>;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function VolumeField({ isLoading, isDisabled, control }: VolumeFieldProps) {
  const [isCustomVolume, setIsCustomVolume] = useState(false);

  function handleToggleCustomVolume() {
    setIsCustomVolume((prev) => !prev);
  }

  return (
    <VStack space="sm" className="mx-5">
      <Text className="font-JakartaMedium">How much milk do you need?</Text>
      <Card variant="filled" className="flex-col gap-5" isDisabled={isDisabled}>
        <ButtonGroupField
          control={control}
          name="volumeNeeded"
          items={Object.values(VOLUME_PRESET)}
          transformItem={(item) => item}
          isDisabled={isCustomVolume}
          isLoading={isLoading}
        />

        <HStack space="sm" className="items-start">
          <Button
            size="sm"
            variant="outline"
            className={buttonStyle({ isToggled: isCustomVolume })}
            onPress={handleToggleCustomVolume}
          >
            <ButtonText className={buttonTextStyle({ isToggled: isCustomVolume })}>
              Custom
            </ButtonText>
          </Button>

          {isCustomVolume && (
            <NumberInputField
              control={control}
              name="volumeNeeded"
              inputProps={{
                placeholder: 'Enter volume in mL',
                variant: 'underlined',
                containerClassName: 'w-48',
              }}
            />
          )}
        </HStack>
      </Card>
    </VStack>
  );
}
