import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Dimensions } from 'react-native';
import { CarouselRenderItem } from 'react-native-reanimated-carousel';
import { OnboardingData } from './data';
import List from './list';

export const OnboardingItem: CarouselRenderItem<OnboardingData> = (args) => {
  const {
    index,
    item: { Image, description, subtitle, title, footer },
  } = args;

  const { width } = Dimensions.get('window');

  return (
    <VStack key={index}>
      <Box className="mx-auto min-h-72 p-4 pb-0">
        <Image width={width * 0.7} height={width * 0.75} />
      </Box>
      <VStack space="xl" className="w-full items-center p-6">
        <VStack className="items-center">
          <Text size="3xl" bold className="text-center">
            {title}
          </Text>
          <Text className="font-JakartaMedium text-primary-700 text-base">{subtitle}</Text>
        </VStack>
        <Text italic size="lg" className="text-typography-950 text-center">
          {description}
        </Text>
        {footer && <List items={footer} />}
      </VStack>
    </VStack>
  );
};
