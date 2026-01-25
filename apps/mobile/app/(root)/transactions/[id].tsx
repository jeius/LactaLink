import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
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
  const middlePos = height * 0.5;
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
    const translateY = Math.max(scrollY.value - 16, middlePos - 16);
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

  return (
    <TransactionProvider transaction={data}>
      <MarkReadTransaction transaction={data} />

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
                <TransactionStatusCard transaction={data} />
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
                    {displayVolume(data.volume || 0)}
                  </Text>
                  <Text size="xs" className="font-JakartaMedium">
                    {TRANSACTION_STATUS[data.status].label}
                  </Text>
                </VStack>
              </Animated.View>
            </HStack>

            <Box
              style={{ flex: 1, marginTop: headerSize.height }}
              onLayout={(e) => setSheetSize(e.nativeEvent.layout)}
            >
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
