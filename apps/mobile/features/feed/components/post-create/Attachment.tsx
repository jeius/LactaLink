import { AnimatedPressable } from '@/components/animated/pressable';
import { useForm } from '@/components/contexts/FormProvider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import DonationCard from '@/features/donation&request/components/cards/DonationCard';
import RequestCard from '@/features/donation&request/components/cards/RequestCard';
import { PostSchema } from '@lactalink/form-schemas';
import { XIcon } from 'lucide-react-native';
import { useWatch } from 'react-hook-form';

export default function Attachment() {
  const { control, setValue } = useForm<PostSchema>();
  const attachment = useWatch({ control, name: 'sharedFrom' });

  const handleRemove = () => {
    setValue('sharedFrom', null, { shouldDirty: true, shouldTouch: true });
  };

  if (!attachment) return null;

  const title = attachment.relationTo === 'donations' ? 'Donation' : 'Request';

  return (
    <VStack space="xs" className="px-3 py-2">
      <HStack className="items-center">
        <Text size="lg" bold className="mb-1 flex-1">
          {title}
        </Text>
        <Pressable className="overflow-hidden rounded-full p-2" onPress={handleRemove}>
          <Icon as={XIcon} className="text-typography-700" />
        </Pressable>
      </HStack>
      <AnimatedPressable className="overflow-hidden rounded-2xl">
        {attachment.relationTo === 'donations' ? (
          <DonationCard data={attachment.value} orientation="horizontal" />
        ) : attachment.relationTo === 'requests' ? (
          <RequestCard data={attachment.value} orientation="horizontal" />
        ) : null}
      </AnimatedPressable>
    </VStack>
  );
}
