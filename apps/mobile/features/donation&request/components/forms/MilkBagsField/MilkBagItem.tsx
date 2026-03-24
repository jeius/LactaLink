import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { deleteMilkBag } from '@/features/donation&request/lib/api/delete';
import { removeMilkBagFromCache } from '@/features/donation&request/lib/cacheUtils/milkbags';
import { getPrimaryColor } from '@/lib/colors';
import { createTempID, isTempID } from '@/lib/utils/tempID';
import { MilkBagSchema } from '@lactalink/form-schemas';
import { displayVolume } from '@lactalink/utilities';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { CopyIcon, MilkIcon, MinusIcon } from 'lucide-react-native';
import React from 'react';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutRight,
  LinearTransition,
  useAnimatedRef,
} from 'react-native-reanimated';

interface ListItemProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  onDuplicate?: (data: MilkBagSchema) => void;
  value: MilkBagSchema;
  disableRemove?: boolean;
}

export default function MilkBagItem({
  disableRemove,
  onDuplicate,
  isLoading,
  isDisabled,
  value: data,
}: ListItemProps) {
  const router = useRouter();
  const containerRef = useAnimatedRef<Animated.View>();

  const { collectedAt, volume, id } = data;
  const isTemp = isTempID(id);

  const { mutateAsync: handleRemove, isPending: isDeleting } = useMutation({
    meta: { errorMessage: (error) => 'Failed to remove milk bag. ' + extractErrorMessage(error) },
    mutationKey: ['milkBags', 'delete', id],
    mutationFn: () => {
      if (isTemp) return Promise.resolve(null);
      return deleteMilkBag(id, { trash: false, draft: true });
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      if (data) removeMilkBagFromCache(client, data.id);
    },
  });

  const isPending = isDeleting || isTemp;

  function handleEdit() {
    router.push({ pathname: '/donations/create/new-milkbag', params: { id } });
  }

  function handleDuplicate() {
    onDuplicate?.({ ...data, id: createTempID() });
  }

  return (
    <Animated.View
      ref={containerRef}
      layout={LinearTransition}
      className="flex-row items-center gap-2"
      pointerEvents={isPending ? 'none' : 'auto'}
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      <Animated.View entering={FadeIn}>
        <Button
          size="sm"
          action="negative"
          className="h-fit w-fit rounded-full p-2"
          onPress={() => handleRemove()}
          isDisabled={isDisabled || disableRemove}
        >
          {isPending ? <ButtonSpinner /> : <ButtonIcon as={MinusIcon} />}
        </Button>
      </Animated.View>

      <Animated.View className={'flex-1'} entering={FadeInDown} exiting={FadeOutRight}>
        <Pressable onPress={handleEdit} disabled={isDisabled}>
          <Card size="lg" variant="filled" className="relative flex-row gap-4 overflow-visible p-3">
            <HStack space="sm" className="flex-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-12 w-12" />
                  <VStack space="xs" className="flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-full" />
                  </VStack>
                </>
              ) : (
                <>
                  <Box className="h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary-50">
                    <Icon as={MilkIcon} size="2xl" color={getPrimaryColor('600')} />
                  </Box>
                  <VStack className="flex-1">
                    <HStack space="xs" className="items-center">
                      <Text bold>{displayVolume(volume)}</Text>
                    </HStack>
                    <Text size="sm" className="font-JakartaMedium">
                      {formatDate(collectedAt, { shortMonth: true })},{' '}
                      {formatLocaleTime(collectedAt)}
                    </Text>
                  </VStack>
                </>
              )}
            </HStack>
            <Button
              variant="ghost"
              action="default"
              className="h-fit w-fit self-center rounded-none p-1"
              isDisabled={isDisabled}
              hitSlop={8}
              onPress={handleDuplicate}
            >
              <ButtonIcon as={CopyIcon} />
            </Button>
          </Card>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
