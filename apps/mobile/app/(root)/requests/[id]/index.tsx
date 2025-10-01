import { AnimatedProgress } from '@/components/animated/progress';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BasicBadge } from '@/components/badges/BasicBadge';
import {
  DonationRequestBottomCTA,
  DonationRequestCTA,
} from '@/components/buttons/DonationRequestCTA';
import { SingleImageViewer } from '@/components/ImageViewer';
import { DPList, MilkBagList } from '@/components/lists/horizontal-flatlists';
import { ProfileTag } from '@/components/ProfileTag';
import SafeArea from '@/components/SafeArea';
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
import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { getUrgencyAction } from '@/lib/utils/getUrgencyAction';
import { DONATION_REQUEST_STATUS, URGENCY_LEVELS } from '@lactalink/enums';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function RequestDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeColors } = useTheme();

  const screen = useWindowDimensions();
  const isMobile = screen.width <= DEVICE_BREAKPOINTS.phone;

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
    <SafeArea safeTop={false} className="items-stretch">
      <ScrollView
        contentContainerClassName="grow flex-col items-stretch justify-start"
        contentContainerStyle={{ paddingBottom: 64 }}
      >
        <HStack className="items-center justify-between p-5">
          <ProfileTag
            isLoading={isLoading}
            profile={requester && { value: requester, relationTo: 'individuals' }}
            label="Requester"
          />

          <VStack className="items-end">
            {isLoading ? (
              <>
                <Skeleton variant="circular" className="mb-1 h-3 w-20" />
                <Skeleton variant="circular" className="h-3 w-14" />
              </>
            ) : (
              data?.createdAt && (
                <>
                  <Text size="xs">{formatDate(data.createdAt, { shortMonth: true })}</Text>
                  <Text size="xs">{formatLocaleTime(data.createdAt)}</Text>
                </>
              )
            )}
          </VStack>
        </HStack>

        <Box className="bg-background-200 relative h-64 w-full">
          {isLoading ? (
            <Skeleton variant="sharp" />
          ) : (
            <>
              <SingleImageViewer image={image} className="grow" />
              <BasicBadge
                size="lg"
                text={URGENCY_LEVELS[urgency].label}
                action={getUrgencyAction(urgency)}
                className="absolute left-3 top-3"
              />
            </>
          )}

          <GradientBackground
            colors={['transparent', 'transparent', 'black']}
            pointerEvents="none"
            style={{ opacity: 0.6 }}
          />

          <Box className="absolute inset-x-0 bottom-0 -mb-5 px-5">
            <DonationRequestCTA isLoading={isLoading} data={data} />
          </Box>
        </Box>

        <HStack className="mt-4 items-center justify-between p-5">
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
              <VStack>
                <Text bold size="lg">
                  {volume.toLocaleString()} mL
                </Text>
                <Text size="sm">Total Volume Needed</Text>
              </VStack>
              {status && (
                <Card className="bg-tertiary-100 rounded-full border-0 px-4 py-2">
                  <Text className="font-JakartaSemiBold text-tertiary-900">
                    {DONATION_REQUEST_STATUS[status].label}
                  </Text>
                </Card>
              )}
            </>
          )}
        </HStack>

        <VStack className="mb-5 items-stretch px-5">
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

        <Divider />

        <HStack space="2xl" className="flex-wrap items-center p-5">
          <StorageTypeTag isLoading={isLoading} data={data} />
          <DueDateTag isLoading={isLoading} data={data} />
        </HStack>

        <VStack className="mb-5 px-5">
          <Text className="font-JakartaSemiBold mb-1">Reason</Text>
          {isLoading ? (
            <Skeleton className="h-20" />
          ) : (
            <Textarea size="sm" pointerEvents="none">
              <TextareaInput
                defaultValue={reason}
                placeholder="No reason provided."
                editable={false}
                style={{ textAlignVertical: 'top' }}
              />
            </Textarea>
          )}
        </VStack>

        <VStack className="mb-5 px-5">
          <Text className="font-JakartaSemiBold mb-1">Notes</Text>
          {isLoading ? (
            <Skeleton className="h-20" />
          ) : (
            <Textarea size="sm" pointerEvents="none">
              <TextareaInput
                defaultValue={notes}
                placeholder="No notes provided."
                editable={false}
                style={{ textAlignVertical: 'top' }}
              />
            </Textarea>
          )}
        </VStack>

        <MilkBagList isLoading={isLoading} data={extractCollection(bags) || []} className="mb-5" />

        <DPList
          isLoading={isLoading}
          data={extractCollection(data?.deliveryPreferences) || []}
          className="mb-5"
        />
      </ScrollView>
      <DonationRequestBottomCTA isLoading={isLoading} data={data} />
    </SafeArea>
  );
}
