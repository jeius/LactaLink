import { AnimatedPressable } from '@/components/animated/pressable';
import { useMap } from '@/components/contexts/MapProvider';
import TruncatedText from '@/components/TruncatedText';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { TravelMode } from '@lactalink/form-schemas/directions';
import {
  BikeIcon,
  CarIcon,
  ClockIcon,
  FlagIcon,
  FootprintsIcon,
  LucideIcon,
  MapPinIcon,
  RulerDimensionLineIcon,
  XIcon,
} from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import {
  createAnimatedComponent,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import {
  useDirection,
  useDirectionActions,
  useDirectionDestination,
  useDirectionOrigin,
  useDirectionTravelMode,
} from './contexts/directions';

const AnimatedCard = createAnimatedComponent(Card);

export default function DirectionDetails() {
  const insets = useSafeAreaInsets();

  const { direction, isActive, isPending, error } = useDirection();
  const { stopNavigation } = useDirectionActions();

  const origin = useDirectionOrigin();
  const destination = useDirectionDestination();
  const distance = direction?.localizedValues.distance ?? '---';
  const duration = direction?.localizedValues.duration ?? '---';

  const [map] = useMap();

  const handleStopNavigation = useCallback(() => {
    stopNavigation();
    if (origin && destination) {
      map?.hideMarkerInfoWindow(origin.markerID);
      map?.hideMarkerInfoWindow(destination.markerID);
    }
  }, [map, origin, destination, stopNavigation]);

  usePreventBackPress(isActive, handleStopNavigation);

  useEffect(() => {
    if (error) {
      toast.error('Failed to get directions. Please try again!');
    }
  }, [error]);

  if (!isActive) return null;

  return (
    <VStack space="lg" className="absolute justify-between px-4 py-2" style={{ ...insets }}>
      <AnimatedCard
        entering={FadeInUp.duration(300)}
        exiting={FadeOutUp.duration(300)}
        className="flex-row items-start p-0"
      >
        <VStack space="xs" className="m-4 mr-0 flex-1 items-start">
          <HStack space="xs" className="items-start">
            <Icon as={MapPinIcon} />
            <TruncatedText initialLines={1} containerClassName="flex-1">
              {origin?.name ?? 'Unknown Location'}
            </TruncatedText>
          </HStack>

          <VStack space="xs" className="mx-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Box key={index} className="h-1 w-1 rounded-full bg-typography-600" />
            ))}
          </VStack>

          <HStack space="xs" className="items-start">
            <Icon as={FlagIcon} />
            <TruncatedText initialLines={1} containerClassName="flex-1">
              {destination?.name ?? 'Unknown Location'}
            </TruncatedText>
          </HStack>
        </VStack>
        <AnimatedPressable
          className="m-3 overflow-hidden rounded-full p-2"
          onPress={handleStopNavigation}
        >
          <Icon as={XIcon} className="text-typography-600" />
        </AnimatedPressable>
      </AnimatedCard>

      <AnimatedCard
        entering={FadeInDown.duration(300)}
        exiting={FadeOutDown.duration(300)}
        className="self-center rounded-3xl border-0 bg-background-0 p-0"
      >
        <HStack space="2xl" className="justify-between px-3 py-2">
          <HStack space="xs" className="items-center">
            <Icon as={ClockIcon} />
            {isPending ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <Text numberOfLines={1} className="font-JakartaSemiBold">
                {duration}
              </Text>
            )}
          </HStack>

          <HStack space="xs" className="items-center">
            <Icon as={RulerDimensionLineIcon} />
            {isPending ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <Text numberOfLines={1} className="font-JakartaSemiBold">
                {distance}
              </Text>
            )}
          </HStack>
        </HStack>

        <TravelModeSelector />
      </AnimatedCard>
    </VStack>
  );
}

function TravelModeSelector() {
  const mode = useDirectionTravelMode();
  const { setInputs } = useDirectionActions();

  const modeActions: { icon: LucideIcon; value: TravelMode; label: string }[] = [
    {
      icon: FootprintsIcon,
      value: 'WALK',
      label: 'Walk',
    },
    {
      icon: BikeIcon,
      value: 'TWO_WHEELER',
      label: 'Two Wheeler',
    },
    {
      icon: CarIcon,
      value: 'DRIVE',
      label: 'Drive',
    },
  ];

  const pressableStyle = tva({
    base: 'flex-1 items-center justify-center p-3',
    variants: {
      active: {
        true: 'bg-primary-100',
      },
    },
  });

  const iconStyle = tva({
    base: 'text-typography-900',
    variants: {
      active: {
        true: 'text-primary-600',
      },
    },
  });

  return (
    <HStack
      className="overflow-hidden rounded-full border border-outline-400 bg-background-0"
      style={{ minWidth: 72 * 3 }}
    >
      {modeActions.map(({ icon, value, label }) => {
        const isActive = mode === value;
        const handlePress = () => setInputs({ mode: value });

        return (
          <Pressable
            key={value}
            className={pressableStyle({ active: isActive })}
            onPress={handlePress}
            accessibilityLabel={`Select ${label} mode`}
          >
            <Icon as={icon} size="xl" className={iconStyle({ active: isActive })} />
          </Pressable>
        );
      })}
    </HStack>
  );
}
