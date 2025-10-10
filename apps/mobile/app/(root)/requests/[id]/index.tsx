import { AnimatedProgress } from '@/components/animated/progress';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BasicBadge } from '@/components/badges/BasicBadge';
import {
  DonationRequestBottomCTA,
  DonationRequestCTA,
} from '@/components/buttons/DonationRequestCTA';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { SingleImageViewer } from '@/components/ImageViewer';
import { DPList, MilkBagList } from '@/components/lists/horizontal-flatlists';
import { ProfileTag } from '@/components/ProfileTag';
import { DueDateTag, StorageTypeTag } from '@/components/tags';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { useParallaxAnimationStyles } from '@/hooks/useAnimationStyles';
import { getColor, getTypographyColor } from '@/lib/colors';
import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { getUrgencyAction } from '@/lib/utils/getUrgencyAction';
import { DONATION_REQUEST_STATUS, URGENCY_LEVELS } from '@lactalink/enums';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedRef, useScrollOffset } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IMAGE_HEIGHT = 180;
const ACCENT_COLOR = getColor('tertiary', '100');

const AnimatedText = Animated.createAnimatedComponent(Text);

export default function RequestDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeColors } = useTheme();
  const insets = useSafeAreaInsets();

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
    accentColor: ACCENT_COLOR,
  });

  const screen = useWindowDimensions();
  const isMobile = screen.width <= DEVICE_BREAKPOINTS.phone;

  const [ctaHeight, setCTAHeight] = useState(0);

  const { data, ...query } = useFetchById(!!id, {
    collection: 'requests',
    id,
  });

  const isLoading = query.isLoading;
  const volume = data?.initialVolumeNeeded || 0;
  const fulfilledVolume = data?.volumeFulfilled || 0;
  const percentage = Math.round((fulfilledVolume / volume) * 100);

  const requester = extractCollection(data?.requester);

  const status = data?.status;
  const notes = data?.details?.notes || '';
  const reason = data?.details?.reason || '';
  const urgency = data?.details?.urgency || URGENCY_LEVELS.LOW.value;

  const { image, bags } = useMemo(() => {
    const requestImg = extractCollection(data?.details?.image);
    const image = extractOneImageData(requestImg, isMobile ? 'sm' : 'lg');
    const bags = extractCollection(data?.details?.bags);
    return { image, bags };
  }, [data, isMobile]);

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
            className="bg-background-0 absolute inset-0 rounded-full"
            style={titleAnimatedStyles(false)}
          />
          <HeaderBackButton style={{ marginRight: 0 }} tintColor={getTypographyColor('900')} />
        </Box>
        <AnimatedText
          style={titleAnimatedStyles(true)}
          bold
          size="xl"
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {displayVolume(volume)}
        </AnimatedText>
      </HStack>

      <Animated.View className="w-full" style={[{ height: IMAGE_HEIGHT }, animatedImageStyles]}>
        {isLoading ? (
          <Skeleton variant="sharp" />
        ) : (
          <SingleImageViewer contentFit="cover" image={image} className="grow" />
        )}
        <GradientBackground
          colors={['transparent', 'transparent', ACCENT_COLOR]}
          pointerEvents="none"
          style={{ opacity: 0.85 }}
        />
      </Animated.View>

      <Animated.View style={[scrollAnimatedStyles]}>
        <Animated.View className="relative w-full px-5 py-3" style={[headerViewAnimatedStyles]}>
          <Animated.View style={titleAnimatedStyles(false)}>
            <HStack space="xl" className="relative items-center justify-between">
              <ProfileTag
                isLoading={isLoading}
                profile={requester && { value: requester, relationTo: 'individuals' }}
                label="Requester"
              />
              <DonationRequestCTA isLoading={isLoading} data={data} />
            </HStack>
          </Animated.View>

          <Animated.View className="absolute bottom-3 right-5" style={titleAnimatedStyles(true)}>
            <DonationRequestCTA variant="link" isLoading={isLoading} data={data} />
          </Animated.View>
        </Animated.View>

        <Animated.ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + ctaHeight + 120 }}
          contentContainerClassName="bg-background-50 flex-col items-stretch justify-start py-5 gap-8"
          style={{ zIndex: 99 }}
        >
          <>
            <VStack space="2xl" className="px-5">
              <HStack className="items-stretch justify-between">
                {isLoading ? (
                  <>
                    <VStack>
                      <Skeleton variant="rounded" className="mb-1 h-6 w-32" />
                      <Skeleton variant="rounded" className="h-4 w-24" />
                    </VStack>
                    <Skeleton variant="circular" className="h-10 w-32" />
                  </>
                ) : (
                  <>
                    <VStack className="items-start">
                      <BasicBadge
                        size="sm"
                        text={URGENCY_LEVELS[urgency].label}
                        action={getUrgencyAction(urgency)}
                        className="mb-1"
                      />
                      <Text bold size="2xl" ellipsizeMode="tail" numberOfLines={1}>
                        {displayVolume(volume)}
                      </Text>
                      <Text size="sm">Total Volume Needed</Text>
                    </VStack>
                    <VStack space="xs" className="items-end">
                      <Box className="flex-1 justify-center">
                        {status && (
                          <Card className="bg-tertiary-100 rounded-full border-0 px-4 py-2">
                            <Text className="font-JakartaSemiBold text-tertiary-900">
                              {DONATION_REQUEST_STATUS[status].label}
                            </Text>
                          </Card>
                        )}
                      </Box>
                      {data && (
                        <Text size="xs">
                          {formatDate(data.createdAt, { shortMonth: true })},{' '}
                          {formatLocaleTime(data.createdAt)}
                        </Text>
                      )}
                    </VStack>
                  </>
                )}
              </HStack>

              <VStack className="items-stretch">
                {isLoading ? (
                  <Skeleton variant="circular" className="mb-1 h-3 w-full" />
                ) : (
                  <>
                    <AnimatedProgress
                      size="sm"
                      orientation="horizontal"
                      value={percentage}
                      trackColor={themeColors.tertiary[500]}
                    />
                    <Text size="xs" className="text-typography-700 text-center">
                      {fulfilledVolume} mL fulfilled
                    </Text>
                  </>
                )}
              </VStack>
            </VStack>

            <Divider />

            <HStack space="2xl" className="flex-wrap items-center px-5">
              <StorageTypeTag isLoading={isLoading} data={data} />
              <DueDateTag isLoading={isLoading} data={data} />
            </HStack>

            <VStack className="px-5">
              <Text className="font-JakartaSemiBold mb-1">Reason</Text>
              {isLoading ? (
                <Skeleton className="h-20" />
              ) : (
                <Textarea className="h-32" pointerEvents="none">
                  <TextareaInput
                    defaultValue={reason}
                    placeholder="No reason provided."
                    editable={false}
                    style={{ textAlignVertical: 'top' }}
                  />
                </Textarea>
              )}
            </VStack>

            <VStack className="px-5">
              <Text className="font-JakartaSemiBold mb-1">Notes</Text>
              {isLoading ? (
                <Skeleton className="h-32" />
              ) : (
                <Textarea className="h-32" pointerEvents="none">
                  <TextareaInput
                    defaultValue={notes}
                    placeholder="No notes provided."
                    editable={false}
                    style={{ textAlignVertical: 'top' }}
                  />
                </Textarea>
              )}
            </VStack>

            <MilkBagList isLoading={isLoading} data={extractCollection(bags) || []} />

            <DPList
              isLoading={isLoading}
              data={extractCollection(data?.deliveryPreferences) || []}
            />
          </>
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
