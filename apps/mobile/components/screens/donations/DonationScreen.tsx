import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { SingleImageViewer } from '@/components/ImageViewer';
import { DPList, MilkBagList } from '@/components/lists/horizontal-flatlists';
import { ProfileTag } from '@/components/ProfileTag';
import { Box } from '@/components/ui/box';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  DonationRequestBottomCTA,
  DonationRequestCTA,
} from '@/features/donation&request/components/DonationRequestCTA';
import ProgressTracker from '@/features/donation&request/components/ProgressTracker';
import { CollectionMethodTag, StorageTypeTag } from '@/features/donation&request/components/tags';
import TextAreaBlock from '@/features/donation&request/components/TextAreaBlock';
import { useDonation } from '@/features/donation&request/hooks/queries';
import { getDonationDetails } from '@/features/donation&request/lib/getDetails';
import { useParallaxAnimationStyles } from '@/hooks/animations/useParallaxAnimationStyles';
import { getTypographyColor } from '@/lib/colors/getColor';
import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IMAGE_HEIGHT = 180;

const AnimatedText = Animated.createAnimatedComponent(Text);

export default function DonationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const screen = useWindowDimensions();

  const accent_color = themeColors.primary[100]!;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useScrollOffset(scrollRef);

  const {
    scrollAnimatedStyles,
    headerViewAnimatedStyles,
    titleAnimatedStyles,
    animatedImageStyles,
  } = useParallaxAnimationStyles(scrollY, {
    insets,
    imageHeight: IMAGE_HEIGHT,
    accentColor: accent_color,
  });

  const fakeViewStyles = useAnimatedStyle(() => ({
    height: Math.min(IMAGE_HEIGHT, scrollY.value),
  }));

  const isMobile = screen.width <= DEVICE_BREAKPOINTS.phone;
  const [ctaHeight, setCTAHeight] = useState(0);

  const { data, isLoading } = useDonation(id);

  const { percentage, remainingVolume, ...details } = getDonationDetails(data, isMobile);

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }} className="bg-background-50">
      {/* Header Section */}
      <HStack
        space="md"
        className="absolute z-10 items-center"
        style={{ top: insets.top + 12, left: 16 }}
      >
        <Box className="relative">
          <Animated.View
            className="absolute inset-0 rounded-full bg-background-0"
            style={titleAnimatedStyles(false)}
          />
          <HeaderBackButton style={{ marginRight: 0 }} tintColor={getTypographyColor('900')} />
        </Box>
        <VStack>
          <AnimatedText
            style={titleAnimatedStyles(true)}
            bold
            size="xl"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {displayVolume(details.volume)}
          </AnimatedText>
          <AnimatedText
            style={titleAnimatedStyles(true)}
            size="sm"
            className="font-JakartaMedium"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {DONATION_REQUEST_STATUS[details.status].label}
          </AnimatedText>
        </VStack>
      </HStack>

      <Animated.View className="w-full" style={[{ height: IMAGE_HEIGHT }, animatedImageStyles]}>
        {isLoading ? (
          <Skeleton variant="sharp" />
        ) : (
          <SingleImageViewer contentFit="cover" image={details.image} className="grow" />
        )}
        <GradientBackground
          colors={['transparent', 'transparent', accent_color]}
          pointerEvents="none"
          style={{ opacity: 0.85 }}
        />
      </Animated.View>

      <Animated.View style={[scrollAnimatedStyles]}>
        <Animated.View className="relative w-full px-5 py-3" style={[headerViewAnimatedStyles]}>
          <Animated.View style={titleAnimatedStyles(false)}>
            <HStack space="xl" className="relative items-center">
              {details.donor && (
                <ProfileTag
                  isLoading={isLoading}
                  profile={{ value: details.donor, relationTo: 'individuals' }}
                  label="Donor"
                />
              )}
              <Box className="flex-1 items-end">
                <DonationRequestCTA isLoading={isLoading} data={data} />
              </Box>
            </HStack>
          </Animated.View>

          <Animated.View className="absolute bottom-3 right-5" style={titleAnimatedStyles(true)}>
            <DonationRequestCTA variant="link" isLoading={isLoading} data={data} />
          </Animated.View>
        </Animated.View>

        <Animated.ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + ctaHeight + 32 }}
          contentContainerClassName="bg-background-50 p-5"
          style={{ zIndex: 99 }}
        >
          <Animated.View style={fakeViewStyles} />
          <VStack space="3xl">
            <VStack space="2xl">
              <HStack className="justify-between">
                {isLoading ? (
                  <>
                    <VStack>
                      <Skeleton variant="rounded" className="mb-1 h-6 w-32" />
                      <Skeleton variant="rounded" className="h-4 w-24" />
                    </VStack>
                    <Skeleton variant="rounded" className="h-10 w-32" />
                  </>
                ) : (
                  <>
                    <VStack className="items-start">
                      <Text bold size="2xl" ellipsizeMode="tail" numberOfLines={1}>
                        {displayVolume(details.volume)}
                      </Text>
                      <Text size="sm"> {DONATION_REQUEST_STATUS[details.status].label}</Text>
                    </VStack>
                  </>
                )}
              </HStack>

              <ProgressTracker
                isLoading={isLoading}
                percentage={percentage}
                label={`${displayVolume(remainingVolume)} available`}
              />
            </VStack>

            <HStack space="2xl" className="flex-wrap items-center">
              <StorageTypeTag isLoading={isLoading} data={data} />
              <CollectionMethodTag isLoading={isLoading} data={data} />
            </HStack>

            <TextAreaBlock
              isLoading={isLoading}
              title="Notes"
              content={details.notes}
              placeholder="No notes provided"
            />

            <MilkBagList
              className="-mx-5"
              isLoading={isLoading}
              data={extractCollection(details.bags) || []}
            />

            <DPList
              isLoading={isLoading}
              className="-mx-5"
              data={extractCollection(data?.deliveryPreferences) || []}
            />
          </VStack>
        </Animated.ScrollView>
      </Animated.View>

      <DonationRequestBottomCTA
        onLayout={({ nativeEvent }) => setCTAHeight(nativeEvent.layout.height)}
        isLoading={isLoading}
        data={data}
      />
    </View>
  );
}
