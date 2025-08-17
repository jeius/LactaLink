import { useTheme } from '@/components/AppProvider/ThemeProvider';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { DynamicStack } from '@/components/ui/DynamicStack';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { extractCollection } from '@lactalink/utilities';
import { Href, Link } from 'expo-router';
import { ChevronRight, LucideIcon, TimerIcon } from 'lucide-react-native';
import React, { ComponentProps, FC, ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SvgProps } from 'react-native-svg';

export default function InventoryPage() {
  const { data: user } = useMeUser();
  const profile = extractCollection(user?.profile?.value);
  const name = profile && 'name' in profile && profile.name;

  const { width } = useWindowDimensions();
  const isMobile = width <= DEVICE_BREAKPOINTS.phone;

  const volumeAvailable = 120345; // Example volume in stock
  const volumeAboutToExpire = 3021; // Example volume about to expire

  const volumeExpired = 520; // Example volume expired
  const volumeDonated = 45637; // Example volume donated
  const volumeUsed = 820; // Example volume used
  const volumeReceived = 32145; // Example volume received
  const statsTimeline = 'Jul. 24 - Aug. 1'; // Example timeline for stats
  const newVolumePercentage = Math.round((volumeReceived / volumeAvailable) * 100); // Example percentage of new volume

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <ScrollView style={{ flex: 1 }} contentContainerClassName="p-5">
        <VStack space="xl" className="justify-start">
          <Text className="font-JakartaSemiBold shrink">
            {name ? `${name}'s Inventory` : 'Inventory'}
          </Text>

          <DynamicStack
            orientation={isMobile ? 'vertical' : 'horizontal'}
            space="xl"
            className="w-full items-stretch"
          >
            <VolumeStatCard
              title="Available"
              value={volumeAvailable}
              description={`+ ${newVolumePercentage}%`}
              className="flex-1"
            />
            <VolumeStatCard
              title="Expiring Soon"
              value={volumeAboutToExpire}
              description={`in 3 days`}
              icon={TimerIcon}
              className="flex-1"
            />
          </DynamicStack>

          <HStack space="md" className="w-full items-center">
            <Divider className="flex-1" />
            <Text size="sm" className="self-end">
              Data from:{' '}
              <Text size="sm" className="font-JakartaMedium">
                {statsTimeline}
              </Text>
            </Text>
          </HStack>

          <HStack space="xl" className="flex-wrap items-stretch">
            <VolumeStatCard
              title="Consumed"
              value={volumeUsed}
              valueSize="md"
              action={<ActionButton href="/inventory/consumed" />}
              className="grow"
            />
            <VolumeStatCard
              title="Expired"
              value={volumeExpired}
              valueSize="md"
              action={<ActionButton href="/inventory/expired" />}
              className="grow"
            />
            <VolumeStatCard
              title="Donated"
              value={volumeDonated}
              valueSize="md"
              action={<ActionButton href="/inventory/donated" />}
              className="grow"
            />
            <VolumeStatCard
              title="Received"
              value={volumeReceived}
              valueSize="md"
              action={<ActionButton href="/inventory/received" />}
              className="grow"
            />
          </HStack>

          <Divider className="self-start" />
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}

function ActionButton({ href }: { href: Href }) {
  return (
    <Link href={href} asChild>
      <Button hitSlop={8} className="h-fit w-fit rounded-full p-1">
        <ButtonIcon as={ChevronRight} />
      </Button>
    </Link>
  );
}

interface VolumeStatCardProps extends ComponentProps<typeof Card> {
  title: string;
  value: number;
  valueSize?: 'xl' | 'lg' | 'md' | 'sm';
  description?: string;
  icon?: LucideIcon | FC<SvgProps>;
  action?: ReactNode;
}

function VolumeStatCard({
  title,
  value,
  valueSize = 'xl',
  description,
  icon,
  action,
  ...cardProps
}: VolumeStatCardProps) {
  const { themeColors } = useTheme();
  return (
    <Card {...cardProps} style={{ minWidth: 150 }}>
      <HStack space="md" className="items-center">
        <VStack space="xs" className="grow items-stretch">
          <HStack space="lg" className="items-center justify-between">
            <Text size="sm" className="font-JakartaMedium">
              {title}
            </Text>
            {icon && <Icon as={icon} color={themeColors.primary[500]} />}
          </HStack>
          <Text bold size={valueSize}>
            {value.toLocaleString()} mL
          </Text>
          {description && (
            <Text size="sm" className="text-typography-800">
              {description}
            </Text>
          )}
        </VStack>

        {action}
      </HStack>
    </Card>
  );
}
