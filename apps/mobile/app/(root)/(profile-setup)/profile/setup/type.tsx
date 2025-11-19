import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Radio, RadioGroup } from '@/components/ui/radio';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import React from 'react';

import { Image } from '@/components/Image';
import { profileTypeOptions } from '@/features/profile/lib/options';
import { ProfileTypeOptions } from '@/features/profile/types';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import { useFormContext, useWatch } from 'react-hook-form';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const cardStyle = tva({
  base: 'relative min-h-40 border border-outline-200',
  variants: {
    selected: {
      true: 'border-2 border-primary-500',
    },
  },
});

const imageBoxStyle = tva({
  base: 'absolute inset-0',
  variants: {
    variant: {
      primary: 'bg-primary-0',
      secondary: 'bg-secondary-0',
      tertiary: 'bg-tertiary-50',
    },
  },
});

const titleBoxStyle = tva({
  base: 'rounded-lg p-2',
  variants: {
    variant: {
      primary: 'bg-primary-300',
      secondary: 'bg-secondary-300',
      tertiary: 'bg-tertiary-300',
    },
  },
});

const titleStyle = tva({
  base: 'font-JakartaSemiBold capitalize',
  variants: {
    variant: {
      primary: 'text-primary-900',
      secondary: 'text-secondary-900',
      tertiary: 'text-tertiary-900',
    },
  },
});

const descriptionBoxStyle = tva({
  base: 'rounded-lg p-2 opacity-90',
  variants: {
    variant: {
      primary: 'bg-primary-200',
      secondary: 'bg-secondary-200',
      tertiary: 'bg-tertiary-200',
    },
  },
});

const descriptionStyle = tva({
  base: 'capitalize',
  variants: {
    variant: {
      primary: 'text-primary-900',
      secondary: 'text-secondary-900',
      tertiary: 'text-tertiary-900',
    },
  },
});

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function SelectProfileType() {
  const { setValue, control } = useFormContext<SetupProfileSchema>();
  const selected = useWatch({ control, name: 'profileType' });

  function handleRadioChange(newValue: typeof selected) {
    setValue('profileType', newValue, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <VStack className="flex-1 p-5">
      <Text bold size="xl" className="mb-4 self-center">
        Choose your account type
      </Text>

      <RadioGroup className="gap-4" onChange={handleRadioChange}>
        {profileTypeOptions.map((option, i) => {
          const type = option.type;
          const isSelected = selected === type;
          return (
            <Radio key={i} value={type}>
              <RadioItem {...option} isSelected={isSelected} />
            </Radio>
          );
        })}
      </RadioGroup>
    </VStack>
  );
}

function RadioItem({
  type,
  description,
  image,
  styleVariant,
  isSelected,
}: ProfileTypeOptions & { isSelected: boolean }) {
  const animatedScaleStyle = useAnimatedStyle(() => {
    const scale = withSpring(isSelected ? 1 : 0.95, { stiffness: 600, damping: 50 });
    return { transform: [{ scale }] };
  }, [isSelected]);

  return (
    <AnimatedCard className={cardStyle({ selected: isSelected })} style={animatedScaleStyle}>
      <Box className={imageBoxStyle({ variant: styleVariant })}>
        <Image
          alt={image.alt}
          source={image.source}
          contentFit="contain"
          style={{ height: '100%', width: '100%' }}
        />
      </Box>
      <VStack space="md" className="items-start">
        <Box className={titleBoxStyle({ variant: styleVariant })}>
          <Text size="lg" className={titleStyle({ variant: styleVariant })}>
            {type.toLowerCase().split('_').join(' ')}
          </Text>
        </Box>
        <Box className={descriptionBoxStyle({ variant: styleVariant })}>
          <Text className={descriptionStyle({ variant: styleVariant })}>{description}</Text>
        </Box>
      </VStack>
    </AnimatedCard>
  );
}
