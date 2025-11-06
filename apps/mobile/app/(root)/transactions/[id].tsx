import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { TransactionBottomSheet } from '@/components/bottom-sheets/TransactionBottomSheet';
import { LocateButton } from '@/components/buttons/LocateButton';
import { TransactionStatusCard } from '@/components/cards/TransactionDeliveryCard';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import MapView from '@/components/map/MapWrapper';
import SafeArea from '@/components/SafeArea';
import { HANDLEHEIGHT } from '@/components/ui/BottomSheetHandle';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTransactionQuery } from '@/hooks/transactions/fetcher';
import { shadow } from '@/lib/utils/shadows';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { ErrorSearchParams } from '@lactalink/types';
import { displayVolume } from '@lactalink/utilities';
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

function useAnimStyles(scrollY: SharedValue<number>, height: number) {
  const middlePos = height * 0.45;
  const snapPoints = useMemo(() => [HANDLEHEIGHT, middlePos, '100%'], [middlePos]);

  const animatedHeaderInStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [middlePos, 0], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  const animatedHeaderOutStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [middlePos, 0], [1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    const translateY = Math.max(scrollY.value - HANDLEHEIGHT - 20, middlePos + 20);
    return { transform: [{ translateY }] };
  });

  return { animatedHeaderInStyle, animatedHeaderOutStyle, animatedCardStyle, snapPoints };
}

export default function TransactionPage() {
  const insets = useSafeAreaInsets();
  const screen = useWindowDimensions();
  const { themeColors } = useTheme();

  const [headerSize, setHeaderSize] = useState<Layout>({ width: 0, height: 100 });
  const [sheetSize, setSheetSize] = useState<Layout>({
    width: 0,
    height: screen.height - insets.top - insets.bottom,
  });

  const scrollY = useSharedValue(0);
  const { animatedHeaderInStyle, animatedHeaderOutStyle, animatedCardStyle, snapPoints } =
    useAnimStyles(scrollY, sheetSize.height);

  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, error } = useTransactionQuery(id);

  if (!isLoading && error) {
    const params: ErrorSearchParams = {
      title: 'Transaction Not Found',
      message: error.message,
      action: 'go-back',
    };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <>
      <Stack.Screen options={{ contentStyle: { backgroundColor: themeColors.background[0] } }} />
      <SafeArea safeTop={false} className="items-stretch bg-background-0">
        <MapView>
          <VStack className="flex-1">
            <Animated.View className="absolute inset-0" style={animatedCardStyle}>
              <Box className="px-5">
                <Box
                  className="absolute right-4 top-0"
                  style={{ transform: [{ translateY: -56 }] }}
                >
                  <LocateButton disableFollowUser />
                </Box>
                <TransactionStatusCard transactionID={id} />
              </Box>
            </Animated.View>

            {/* Header */}
            <Box
              className="absolute inset-x-0 top-0 z-10"
              onLayout={(e) => setHeaderSize(e.nativeEvent.layout)}
            >
              <Box
                className="flex-row items-center gap-2 px-4"
                style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
              >
                {/* Header Background */}
                <Animated.View
                  className="absolute inset-0 border-b border-outline-100 bg-background-0"
                  style={[shadow.md, animatedHeaderInStyle]}
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
                <Animated.View className="flex-col" style={animatedHeaderInStyle}>
                  <Text bold size="lg">
                    {displayVolume(data?.matchedVolume || 0)}
                  </Text>
                  <Text size="xs" className="font-JakartaMedium">
                    {data && TRANSACTION_STATUS[data.status].label}
                  </Text>
                </Animated.View>
              </Box>
            </Box>

            <Box
              style={{ flex: 1, marginTop: headerSize.height - HANDLEHEIGHT }}
              onLayout={(e) => setSheetSize(e.nativeEvent.layout)}
            >
              <TransactionBottomSheet
                transactionID={id}
                snapPoints={snapPoints}
                snapToIndex={1}
                animatedPosition={scrollY}
              />
            </Box>
          </VStack>
        </MapView>
      </SafeArea>
    </>
  );
}
