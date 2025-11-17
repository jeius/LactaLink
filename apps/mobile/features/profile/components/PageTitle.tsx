import { Image } from '@/components/Image';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { getIconAsset } from '@/lib/stores/assetsStore';
import { ProfileType } from '@/lib/types';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

const title: Record<ProfileType, string> = {
  INDIVIDUAL: 'Personal',
  HOSPITAL: 'Hospital',
  MILK_BANK: 'Milk Bank',
};

export default function PageTitle({ space = 'sm', ...props }: VStackProps) {
  const { control } = useFormContext<SetupProfileSchema>();
  const profileType = useWatch({ control, name: 'profileType' });

  return (
    <VStack {...props} space={space}>
      <HStack space="md" className="items-center">
        <Image
          source={getIconAsset('information')}
          alt="Information"
          style={{ width: 40, height: 40 }}
        />
        <Text size="xl" bold>
          {title[profileType]} Information
        </Text>
      </HStack>
      <Text>
        Please take a moment to fill out the fields below. Rest assured, your information is safe
        with us.
      </Text>
    </VStack>
  );
}
