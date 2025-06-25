import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CarouselRenderItem } from 'react-native-reanimated-carousel';
import { OnboardingData } from './data';
import List from './list';

export const OnboardingItem: CarouselRenderItem<OnboardingData> = (args) => {
  const {
    index,
    item: { image, description, subtitle, title, footer },
  } = args;

  return (
    <VStack key={index}>
      <Box className="mx-auto h-72 w-full p-4 pb-0">
        <Image
          alt={image.alt}
          source={image.source}
          contentFit="contain"
          style={{ width: '100%', height: '100%' }}
          recyclingKey={`onboarding-image-${index}`}
        />
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
