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
    item: { image, description, subtitle, title, footer: listItems },
  } = args;

  return (
    <VStack key={index} className="h-full w-full">
      <Box className="h-72 p-4 pb-0">
        <Image
          alt={image.alt}
          source={image.source}
          contentFit="contain"
          style={{ width: '100%', height: '100%' }}
          recyclingKey={`onboarding-image-${index}`}
        />
      </Box>

      <VStack className="flex-1 p-6">
        <Text size="3xl" bold className="mb-1 text-center">
          {title}
        </Text>

        <Text className="mb-5 text-center font-JakartaMedium text-primary-700">{subtitle}</Text>

        <Text italic size="lg" className="mb-5 text-center text-typography-900">
          {description}
        </Text>

        {listItems && <List items={listItems} />}
      </VStack>
    </VStack>
  );
};
