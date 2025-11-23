import { AnimatedPressable } from '@/components/animated/pressable';
import DonationCard from '@/components/cards/DonationCard';
import RequestCard from '@/components/cards/RequestCard';
import { useForm } from '@/components/contexts/FormProvider';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { PostSchema } from '@lactalink/form-schemas';
import { XIcon } from 'lucide-react-native';
import React from 'react';
import { useWatch } from 'react-hook-form';

export default function Attachment() {
  const { control, setValue } = useForm<PostSchema>();
  const attachment = useWatch({ control, name: 'sharedFrom' });

  const handleRemove = () => {
    setValue('sharedFrom', undefined, { shouldDirty: true, shouldTouch: true });
  };

  if (!attachment) return null;

  return (
    <Box className="p-4">
      <Text className="mb-1 font-JakartaSemiBold">Attachment</Text>
      <AnimatedPressable className="overflow-hidden rounded-2xl">
        {attachment.relationTo === 'donations' ? (
          <DonationCard data={attachment.value} orientation="horizontal" />
        ) : attachment.relationTo === 'requests' ? (
          <RequestCard data={attachment.value} orientation="horizontal" />
        ) : null}

        <Pressable
          className="absolute overflow-hidden rounded-full p-2"
          style={{ top: 8, right: 8 }}
          onPress={handleRemove}
        >
          <Icon as={XIcon} className="text-typography-700" />
        </Pressable>
      </AnimatedPressable>
    </Box>
  );
}
