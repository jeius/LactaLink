import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CarouselRenderItem } from 'react-native-reanimated-carousel';
import { OnboardingData } from '../_data';
import List from './list';

export const Onboarding: CarouselRenderItem<OnboardingData> = (args) => {
  const {
    index,
    item: { Image, description, subtitle, title, footer },
  } = args;

  return (
    <VStack key={index} className="gap-0">
      <Box className="h-80 w-full p-4">
        <Image className="object-cover" />
      </Box>
      <VStack space="4xl" className="w-full items-center p-6">
        <VStack space="md" className="items-center">
          <Text size="3xl" bold className="text-center">
            {title}
          </Text>
          <Text className="font-JakartaMedium text-primary-700 text-base">{subtitle}</Text>
        </VStack>
        <Text italic size="lg" className="text-center">
          {description}
        </Text>
        {footer && <List items={footer} />}
      </VStack>
    </VStack>
  );
};
