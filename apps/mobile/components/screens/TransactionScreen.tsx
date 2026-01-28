import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';

import { LocateButton } from '@/components/buttons/LocateButton';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import MapView from '@/components/map/MapView';
import SafeArea from '@/components/SafeArea';
import { HANDLEHEIGHT } from '@/components/ui/BottomSheetHandle';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { TransactionProvider } from '@/features/transactions/components/context';
import MarkReadTransaction from '@/features/transactions/components/MarkReadTransaction';
import { TransactionSheet } from '@/features/transactions/components/TransactionSheet';
import TransactionStatusCard from '@/features/transactions/components/TransactionStatusCard';
import { useTransaction } from '@/features/transactions/hooks/queries';
import { createUpdatesMessage } from '@/features/transactions/lib/createUpdatesMessage';
import { extractDeliveryDetail } from '@/features/transactions/lib/extractors';
import { getColor } from '@/lib/colors';
import { DELIVERY_OPTIONS, TRANSACTION_STATUS } from '@lactalink/enums';
import { ErrorSearchParams } from '@lactalink/types';
import { Layout } from '@react-navigation/elements';
import { StyleSheet } from 'react-native';
import { useWindowDimensions } from 'react-native-keyboard-controller';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function useAnimStyles(scrollY: SharedValue<number>, cardHeight: SharedValue<number>) {
  const screen = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const midPoint = HANDLEHEIGHT + 128 + 4;
  const snapPoints = useMemo(() => [HANDLEHEIGHT, midPoint, '100%'], [midPoint]);

  const animatedHeaderInStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [midPoint, 0], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  const animatedHeaderOutStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [midPoint, 0], [1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    const translateY = Math.max(
      scrollY.value + insets.bottom + HANDLEHEIGHT - cardHeight.value,
      screen.height * 0.25
    );
    return { transform: [{ translateY }] };
  });

  return { animatedHeaderInStyle, animatedHeaderOutStyle, animatedCardStyle, snapPoints };
}

export default function TransactionScreen() {
  const insets = useSafeAreaInsets();

  const [headerSize, setHeaderSize] = useState<Layout>({ width: 0, height: 100 });
  const cardHeight = useSharedValue(0);

  const scrollY = useSharedValue(0);
  const { animatedHeaderInStyle, animatedHeaderOutStyle, animatedCardStyle, snapPoints } =
    useAnimStyles(scrollY, cardHeight);

  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, error } = useTransaction(id);

  if (error) {
    const params: ErrorSearchParams = {
      title: 'Transaction Not Found',
      message: error.message,
      action: 'go-back',
    };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  if (isLoading || !data) {
    return <LoadingSpinner />;
  }

  const deliveryDetail = extractDeliveryDetail(data);

  const title = deliveryDetail
    ? DELIVERY_OPTIONS[deliveryDetail.method].label
    : TRANSACTION_STATUS[data.status].label;

  const subtitle = createUpdatesMessage(data);

  return (
    <TransactionProvider transaction={data}>
      <MarkReadTransaction transaction={data} />

      <Stack.Screen options={{ contentStyle: { backgroundColor: getColor('background', '0') } }} />

      <SafeArea safeTop={false} className="items-stretch bg-background-0">
        <MapView mapPadding={{ top: 80, bottom: 164, left: 4, right: 4 }}>
          <VStack className="flex-1">
            <Animated.View className="absolute inset-x-0" style={[animatedCardStyle]}>
              <Box className="px-5">
                <Box
                  className="absolute right-4 top-0"
                  style={{ transform: [{ translateY: -52 }] }}
                >
                  <LocateButton disableFollowUser />
                </Box>
                <TransactionStatusCard
                  transaction={data}
                  onLayout={(e) => cardHeight.set(e.nativeEvent.layout.height)}
                />
              </Box>
            </Animated.View>

            {/* Header */}
            <HStack
              space="sm"
              className="absolute inset-x-0 top-0 z-10 items-center px-4"
              style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
              onLayout={(e) => setHeaderSize(e.nativeEvent.layout)}
            >
              {/* Header Background */}
              <Animated.View
                className="absolute inset-0 border-b border-outline-100 bg-background-0"
                style={[animatedHeaderInStyle]}
              />

              {/* Header Back Button */}
              <Box className="overflow-hidden rounded-full p-0">
                <Animated.View
                  className="rounded-full border border-outline-200 bg-background-100"
                  style={[StyleSheet.absoluteFillObject, animatedHeaderOutStyle]}
                />
                <HeaderBackButton />
              </Box>

              {/* Header Title */}
              <Animated.View
                className="flex-1 flex-row items-center gap-2"
                style={animatedHeaderInStyle}
              >
                <VStack className="flex-1">
                  <Text bold size="lg">
                    {title}
                  </Text>
                  <Text size="xs" numberOfLines={1} className="font-JakartaMedium">
                    {subtitle}
                  </Text>
                </VStack>
              </Animated.View>
            </HStack>

            <Box style={{ flex: 1, marginTop: headerSize.height }}>
              <TransactionSheet
                transaction={data}
                snapPoints={snapPoints}
                snapToIndex={1}
                animatedPosition={scrollY}
              />
            </Box>
          </VStack>
        </MapView>
      </SafeArea>
    </TransactionProvider>
  );
}
