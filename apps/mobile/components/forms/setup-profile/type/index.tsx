import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Center } from '@/components/ui/center';
import { Radio, RadioGroup } from '@/components/ui/radio';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import React, { ReactNode, useEffect } from 'react';

import { Image } from '@/components/ui/image';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { SetupProfileSchema, User } from '@lactalink/types';
import { UseFormReturn } from 'react-hook-form';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { options } from './options';

const cardStyle = tva({
  base: 'relative min-h-40 w-full',
  variants: {
    selected: {
      true: 'border-primary-500 border-2',
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
  base: 'w-full rounded-lg p-2 opacity-90',
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

export default function ProfileType({ form }: { form: UseFormReturn<SetupProfileSchema> }) {
  const { watch, setValue } = form;
  const selected = watch('profileType');

  function handleRadioChange(val: User['profileType']) {
    if (val) setValue('profileType', val);
  }

  return (
    <VStack space="lg">
      <Center>
        <Text bold size="xl">
          Choose your profile type
        </Text>
      </Center>

      <RadioGroup className="gap-4" onChange={handleRadioChange}>
        {options.map(({ type, description, styleVariant, image }, i) => {
          const isSelected = selected === type;
          return (
            <Radio key={i} value={type}>
              <AnimatedScaleWrapper isSelected={isSelected}>
                <Card className={cardStyle({ selected: isSelected })}>
                  <Box className={imageBoxStyle({ variant: styleVariant })}>
                    <Image alt={image.alt} source={image.uri} size="full" />
                  </Box>
                  <VStack space="md" className="items-start">
                    <Box className={titleBoxStyle({ variant: styleVariant })}>
                      <Text size="lg" className={titleStyle({ variant: styleVariant })}>
                        {type.toLowerCase().split('_').join(' ')}
                      </Text>
                    </Box>
                    <Box className={descriptionBoxStyle({ variant: styleVariant })}>
                      <Text className={descriptionStyle({ variant: styleVariant })}>
                        {description}
                      </Text>
                    </Box>
                  </VStack>
                </Card>
              </AnimatedScaleWrapper>
            </Radio>
          );
        })}
      </RadioGroup>
    </VStack>
  );
}

function AnimatedScaleWrapper({
  children,
  isSelected,
}: {
  children: ReactNode;
  isSelected: boolean;
}) {
  const animatedScale = useSharedValue(0.95);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animatedScale.value }],
    width: '100%',
  }));

  useEffect(() => {
    if (isSelected) {
      animatedScale.value = withSpring(1);
    } else {
      animatedScale.value = withSpring(0.95);
    }
  });

  return <Animated.View style={[animatedScaleStyle]}>{children}</Animated.View>;
}
