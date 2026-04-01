import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { SingleImageViewer } from '@/components/ImageViewer';
import { ProfileTag } from '@/components/ProfileTag';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  ListingBottomCTA,
  ListingHeaderCTA,
} from '@/features/donation&request/components/ListingCTA';
import HorizontalDPList from '@/features/donation&request/components/lists/HorizontalDPList';
import HorizontalMilkBagList from '@/features/donation&request/components/lists/HorizontalMilkBagList';
import ProgressTracker from '@/features/donation&request/components/ProgressTracker';
import { DueDateTag, StorageTypeTag } from '@/features/donation&request/components/tags';
import TextAreaBlock from '@/features/donation&request/components/TextAreaBlock';
import { useRequest } from '@/features/donation&request/hooks/queries';
import { useParallaxAnimationStyles } from '@/features/donation&request/hooks/useParallaxAnimationStyles';
import { useReadState } from '@/features/donation&request/hooks/useReadState';
import { getRequestDetails } from '@/features/donation&request/lib/utils';
import { getTypographyColor } from '@/lib/colors';
import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { getUrgencyColor } from '@/lib/utils/getUrgencyAction';
import { URGENCY_LEVELS } from '@lactalink/enums';
import { Request } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IMAGE_HEIGHT = 180;

const AnimatedText = Animated.createAnimatedComponent(Text);

function MarkAsRead({ request }: { request: Request }) {
  const { isUnread, markAsRead } = useReadState(request);

  useFocusEffect(
    useCallback(() => {
      if (isUnread) markAsRead();
    }, [isUnread, markAsRead])
  );

  return null;
}

export default function RequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const screen = useWindowDimensions();

  const accentColor = themeColors.tertiary[100];
  const progressTrackColor = themeColors.tertiary[500];

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useScrollOffset(scrollRef);

  const {
    scrollAnimatedStyles,
    headerViewAnimatedStyles,
    titleAnimatedStyles,
    animatedImageStyles,
    backButtonStyles,
  } = useParallaxAnimationStyles(scrollY, {
    insets,
    imageHeight: IMAGE_HEIGHT,
    accentColor: accentColor,
  });

  const fakeViewStyles = useAnimatedStyle(() => ({
    height: Math.min(IMAGE_HEIGHT, scrollY.value),
  }));

  const isMobile = screen.width <= DEVICE_BREAKPOINTS.phone;

  const [ctaHeight, setCTAHeight] = useState(0);

  const { data, isLoading, isPlaceholderData } = useRequest(id);
  const { urgency, ...details } = useMemo(
    () => getRequestDetails(data, isMobile),
    [data, isMobile]
  );

  return (
    <>
      {data && !isPlaceholderData && <MarkAsRead request={data} />}

      <Box style={{ flex: 1, paddingBottom: insets.bottom }} className="bg-background-50">
        {/* Header Section */}
        <HStack
          space="md"
          className="absolute z-10 items-center"
          style={{ top: insets.top + 12, left: 16 }}
        >
          <Box className="relative">
            <Animated.View
              className="absolute inset-0 rounded-full bg-background-0"
              style={backButtonStyles}
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
              {details.status.label}
            </AnimatedText>
          </VStack>
        </HStack>

        {/* Profile and CTA Section */}
        <Animated.View className="w-full" style={[{ height: IMAGE_HEIGHT }, animatedImageStyles]}>
          {isLoading ? (
            <Skeleton variant="sharp" />
          ) : (
            <SingleImageViewer
              contentFit="cover"
              image={details.image}
              className="flex-1"
              fallback={
                <Box className="flex-1 items-center justify-center">
                  <Text className="mt-6 text-typography-600">No image available</Text>
                </Box>
              }
            />
          )}

          <GradientBackground
            colors={['transparent', 'transparent', accentColor || 'transparent']}
            pointerEvents="none"
            style={{ opacity: 0.85 }}
          />
        </Animated.View>

        {/* Content Section */}
        <Animated.View style={[scrollAnimatedStyles]}>
          {data && (
            <Animated.View className="w-full px-5 py-3" style={[headerViewAnimatedStyles]}>
              <Animated.View style={titleAnimatedStyles(false)}>
                <HStack space="xl" className="items-center">
                  <ProfileTag
                    label="Requester"
                    profile={{ relationTo: 'individuals', value: data.requester }}
                  />
                  <Box className="flex-1 items-end">
                    <ListingHeaderCTA data={data} />
                  </Box>
                </HStack>
              </Animated.View>

              <Animated.View
                className="absolute bottom-3 right-5"
                style={titleAnimatedStyles(true)}
              >
                <ListingHeaderCTA variant="ghost" data={data} />
              </Animated.View>
            </Animated.View>
          )}

          <Animated.ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: insets.bottom + ctaHeight + 32 }}
            contentContainerClassName="bg-background-50 p-5"
            style={{ zIndex: 99 }}
          >
            {/* Animated Spacer */}
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
                        <Text size="sm" className="font-JakartaMedium">
                          {details.status.label}
                        </Text>
                      </VStack>
                      <VStack space="xs" className="items-end">
                        <Box className="flex-1 justify-center">
                          <Card
                            variant="filled"
                            className="rounded-lg border px-4 py-2"
                            style={{
                              backgroundColor: getUrgencyColor(urgency, '50'),
                              borderColor: getUrgencyColor(urgency, '100'),
                            }}
                          >
                            <Text
                              className="font-JakartaSemiBold"
                              style={{ color: getUrgencyColor(urgency, '600') }}
                            >
                              {URGENCY_LEVELS[urgency].label}
                            </Text>
                          </Card>
                        </Box>
                      </VStack>
                    </>
                  )}
                </HStack>

                <ProgressTracker
                  isLoading={isLoading}
                  percentage={details.percentage}
                  trackColor={progressTrackColor}
                  label={`${displayVolume(details.fulfilledVolume)} / ${displayVolume(details.volume)}`}
                />
              </VStack>

              <HStack space="2xl" className="flex-wrap items-center">
                <StorageTypeTag isLoading={isLoading} data={data} />
                <DueDateTag isLoading={isLoading} data={data} />
              </HStack>

              <TextAreaBlock isLoading={isLoading} title="Reason" content={details.reason} />

              <TextAreaBlock
                isLoading={isLoading}
                title="Notes"
                content={details.notes}
                placeholder="No notes provided"
              />

              {(details.bags?.length ?? 0) > 0 && (
                <HorizontalMilkBagList
                  className="-mx-5"
                  isLoading={isLoading}
                  data={details.bags || []}
                />
              )}

              <HorizontalDPList
                isLoading={isLoading}
                className="-mx-5"
                data={extractCollection(data?.deliveryPreferences) || []}
              />
            </VStack>
          </Animated.ScrollView>
        </Animated.View>

        {data && (
          <ListingBottomCTA
            data={data}
            onLayout={({ nativeEvent }) => setCTAHeight(nativeEvent.layout.height)}
          />
        )}
      </Box>
    </>
  );
}
