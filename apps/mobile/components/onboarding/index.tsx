import { useCallback, useRef, useState } from 'react';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import GradientBackground from '@/components/ui/gradient-bg';
import { VStack } from '@/components/ui/vstack';

import { useFocusEffect, useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';

import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingItem } from './OnboardingItem';
import { OnboardingData, onboardingData } from './data';

const gradientColors = ['#FEB4BA', '#FFE6E8', '#FFF3F4'] as const;

export function Welcome() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const prevTheme = useRef(theme);

  const screen = useWindowDimensions();
  const [carouselHeight, setCarouselHeight] = useState(0);

  const setViewedOnboarding = useOnboardingStore((s) => s.setViewed);

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
    if (!isLastSlide) {
      ref.current?.next();
      return;
    }
    setViewedOnboarding(true);
    router.replace('/auth/sign-up');
  }

  function handleSkip() {
    setViewedOnboarding(true);
    router.replace('/auth/sign-in');
  }

  useFocusEffect(
    useCallback(() => {
      setTheme('light');
      return () => {
        setTheme(prevTheme.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <SafeAreaView className="flex-1">
      <GradientBackground colors={gradientColors} end={{ x: 0, y: 1 }} locations={[0, 0.8, 1]} />

      <VStack className="relative flex-1 items-stretch justify-start gap-0 py-4">
        <Button
          variant="link"
          size="sm"
          disablePressAnimation
          className="absolute right-0 top-0 z-10 h-min w-min p-5"
          action="primary"
          style={{ opacity: isLastSlide ? 0 : 1 }}
          onPress={handleSkip}
        >
          <ButtonText size="sm" className="text-primary-600">
            Skip
          </ButtonText>
        </Button>

        <Box
          className="flex-1"
          onLayout={({ nativeEvent }) => setCarouselHeight(nativeEvent.layout.height)}
        >
          <Carousel
            ref={ref}
            loop={false}
            width={screen.width}
            height={carouselHeight}
            onProgressChange={progress}
            onSnapToItem={setCurrentPage}
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
        </Box>

        <Box className="w-full p-5">
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
}
