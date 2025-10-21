import { useFetchById } from '@/hooks/collections/useFetchById';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';

import { DonationListCard, RequestListCard } from '@/components/cards';
import DeliveryCard from '@/components/cards/DeliveryCard';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { MilkBagList } from '@/components/lists/horizontal-flatlists';
import { MapView } from '@/components/map/MapView';
import { ProfileTag } from '@/components/ProfileTag';
import {
  BottomSheet,
  BottomSheetPortal,
  BottomSheetScrollView,
} from '@/components/ui/bottom-sheet';
import { BottomSheetHandle } from '@/components/ui/BottomSheetHandle';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { UserBuildingIcon, UserUserIcon } from '@/components/ui/icon/custom';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { TRANSACTION_TYPE } from '@lactalink/enums';
import { ErrorSearchParams } from '@lactalink/types';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection } from '@lactalink/utilities/extractors';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function useAnimStyles(scrollY: SharedValue<number>) {
  const animatedBgStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 200], [0.75, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: scrollY.value }] };
  });

  return { animatedBgStyle, animatedCardStyle };
}

export default function TransactionPage() {
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);
  const { animatedBgStyle, animatedCardStyle } = useAnimStyles(scrollY);

  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, error } = useFetchById(!!id, {
    collection: 'transactions',
    id: id,
  });

  const { donation, request, type, volumeLabel, milkBags } = useMemo(
    () => extractData(data),
    [data]
  );

  const sender = data?.sender;
  const recipient = data?.recipient;

  const snapPoints = useMemo(() => [30, '60%', '100%'], []);

  if (!isLoading && error) {
    const params: ErrorSearchParams = {
      title: 'Transaction Not Found',
      message: error.message,
      action: 'go-back',
    };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <Box className="flex-1 flex-col" style={{ marginBottom: insets.bottom }}>
      {/* absolute header */}
      <HStack
        space="md"
        className="absolute inset-x-0 items-center p-5"
        style={{ top: insets.top, zIndex: 10 }}
      >
        <Card variant="filled" className="rounded-full bg-transparent p-0">
          <Box
            className="bg-background-300"
            style={{ ...StyleSheet.absoluteFillObject, opacity: 0.75 }}
          />
          <HeaderBackButton style={{ marginRight: 0 }} />
        </Card>
      </HStack>

      <MapView containerStyle={StyleSheet.absoluteFillObject} />

      {/* animated background overlay */}
      <Animated.View
        pointerEvents="none"
        className="bg-background-500"
        style={[StyleSheet.absoluteFillObject, animatedBgStyle]}
      />

      <Animated.View
        className="relative p-5"
        style={[{ marginTop: insets.top }, animatedCardStyle]}
      >
        <DeliveryCard transactionID={id} />
      </Animated.View>

      <Box className="flex-1">
        <BottomSheet snapToIndex={2} disableClose>
          <BottomSheetPortal
            snapPoints={snapPoints}
            snapToIndex={2}
            handleComponent={BottomSheetHandle}
            enableContentPanningGesture={true}
            enableDynamicSizing={false}
            animateOnMount={true}
            backgroundStyle={{ backgroundColor: 'transparent' }}
            animatedPosition={scrollY}
          >
            <BottomSheetScrollView
              contentContainerClassName="flex-col gap-4 bg-background-0 pb-5"
              showsVerticalScrollIndicator={false}
            >
              <VStack space="sm" className="items-stretch">
                <HStack space="md" className="items-center justify-between p-5">
                  <VStack>
                    <Text bold size="xl">
                      {volumeLabel}
                    </Text>
                    <Text>Transaction Volume</Text>
                  </VStack>
                </HStack>

                <HStack space="sm" className="items-center">
                  <Divider className="w-auto flex-1" />
                  <Icon as={data?.transactionType === 'P2P' ? UserUserIcon : UserBuildingIcon} />
                  <Text className="font-JakartaSemiBold">{type}</Text>
                  <Divider className="w-auto flex-1" />
                </HStack>

                <HStack space="md" className="items-center justify-between px-5">
                  <ProfileTag isLoading={isLoading} profile={sender} label="Sender" />
                  <ProfileTag
                    direction="rtl"
                    isLoading={isLoading}
                    profile={recipient}
                    label="Recipient"
                  />
                </HStack>
              </VStack>

              {donation && (
                <VStack space="xs" className="px-5">
                  <Text className="font-JakartaSemiBold mb-1">Donation</Text>
                  <DonationListCard
                    className="border-primary-500"
                    hideFooter
                    data={donation}
                    isLoading={isLoading}
                  />
                </VStack>
              )}

              {request && (
                <VStack space="xs" className="px-5">
                  <Text className="font-JakartaSemiBold mb-1">Request</Text>
                  <RequestListCard
                    className="border-tertiary-500"
                    hideFooter
                    data={request}
                    isLoading={isLoading}
                  />
                </VStack>
              )}

              {milkBags && <MilkBagList data={milkBags} label="Involved Milkbags" />}
            </BottomSheetScrollView>
          </BottomSheetPortal>
        </BottomSheet>
      </Box>
    </Box>
  );
}

function extractData(data: Transaction | undefined) {
  if (!data) return {};
  return {
    transactionNo: data.transactionNumber,
    volumeLabel: displayVolume(data.matchedVolume),
    donation: extractCollection(data.donation),
    request: extractCollection(data.request),
    milkBags: extractCollection(data.matchedBags),
    type: TRANSACTION_TYPE[data.transactionType].label,
  };
}
