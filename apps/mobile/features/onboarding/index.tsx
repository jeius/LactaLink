import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import GradientBackground from '@/components/ui/gradient-bg';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { useOnboardingStore } from '@/lib/stores/onboardingStore';

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native-keyboard-controller';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingItem } from './OnboardingItem';
import { onboardingData } from './data';

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
    }, [setTheme])
  );

  return (
    <SafeAreaView className="flex-1">
      <GradientBackground colors={gradientColors} end={{ x: 0, y: 1 }} locations={[0, 0.8, 1]} />

      <VStack className="flex-1 py-4">
        <AnimatedPressable
          className="absolute right-3 top-5 z-10 px-3 py-2"
          style={{ opacity: isLastSlide ? 0 : 1 }}
          onPress={handleSkip}
          hitSlop={8}
        >
          <Text size="lg" bold className="text-primary-700">
            Skip
          </Text>
        </AnimatedPressable>

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
        </Box>

        <Pagination.Basic
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

        <Button
          size="xl"
          className="mx-5 rounded-full shadow-md shadow-primary-800"
          onPress={handleNext}
        >
          <ButtonText>{isLastSlide ? 'Get Started' : 'Next'}</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
