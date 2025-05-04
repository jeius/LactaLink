import { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ButtonText } from '@/components/ui/button';
import GradientBackground from '@/components/ui/gradient-bg';
import { VStack } from '@/components/ui/vstack';
import { Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { Box } from '@/components/ui/box';
import { router } from 'expo-router';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';

import { OnboardingItem } from '@/components/onboarding';
import { OnboardingData, onboardingData } from '@/components/onboarding/data';
import { MMKV_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';

const gradientColors = ['#FEB4BA', '#FFE6E8', '#FFF3F4'] as const;

const Home = () => {
  const { height, width } = Dimensions.get('window');
  const progress = useSharedValue<number>(0);
  const ref = useRef<ICarouselInstance>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const lastPage = onboardingData.length - 1;

  const isLastSlide = currentPage === lastPage;

  function onPressPagination(index: number) {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  }

  function handleNext() {
    if (isLastSlide) {
      router.replace('/sign-up');
    }
    ref.current?.next();
  }

  function handleSkip() {
    Storage.set(MMKV_KEYS.ONBOARDING, true);
    router.replace('/sign-in');
  }

  function handleScrollEnd() {
    Storage.set(MMKV_KEYS.ONBOARDING, true);
  }

  return (
    <SafeAreaView className="relative h-full flex-1 items-center justify-between">
      <GradientBackground colors={gradientColors} end={{ x: 0, y: 1 }} locations={[0, 0.8, 1]} />

      <VStack className="relative w-full items-end justify-start gap-0 py-4">
        <Button
          variant="link"
          size="sm"
          className="absolute right-0 top-0 z-10 h-min w-min p-5"
          action="primary"
          style={{ opacity: isLastSlide ? 0 : 1 }}
          onPress={handleSkip}
        >
          <ButtonText size="sm" className="text-primary-600">
            Skip
          </ButtonText>
        </Button>

        <Carousel
          ref={ref}
          loop={false}
          width={width}
          height={height * 0.85}
          onProgressChange={progress}
          onSnapToItem={setCurrentPage}
          onScrollEnd={handleScrollEnd}
          data={onboardingData}
          renderItem={OnboardingItem}
          pagingEnabled
          scrollAnimationDuration={400}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 1,
            parallaxScrollingOffset: 30,
            parallaxAdjacentItemScale: 0.7,
          }}
        />

        <Pagination.Basic<OnboardingData>
          progress={progress}
          data={onboardingData}
          dotStyle={{
            width: 25,
            height: 4,
            backgroundColor: '#FEB4BA',
            borderRadius: 4,
          }}
          activeDotStyle={{
            overflow: 'hidden',
            backgroundColor: '#CB6870',
          }}
          containerStyle={{
            gap: 10,
            marginBottom: 16,
          }}
          horizontal
          onPress={onPressPagination}
        />

        <Box className="w-full p-5 pt-2">
          <Button
            size="xl"
            className="shadow-primary-800 w-full rounded-2xl shadow-md"
            onPress={handleNext}
          >
            <ButtonText size="lg" className="font-JakartaMedium">
              {isLastSlide ? 'Get Started' : 'Next'}
            </ButtonText>
          </Button>
        </Box>
      </VStack>
    </SafeAreaView>
  );
};

export default Home;
