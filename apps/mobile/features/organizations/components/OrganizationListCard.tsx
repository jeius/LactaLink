import { BasicBadge } from '@/components/badges';
import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { Hospital, MilkBank } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractImageData } from '@lactalink/utilities/extractors';
import { DatabaseIcon } from 'lucide-react-native';
import { FC, ReactNode } from 'react';

const cardStyles = tva({
  base: 'p-0',
});

interface OrganizationListCardProps extends CardProps {
  data: Hospital | MilkBank;
  badgeLabel?: string;
  action?: ReactNode;
  canViewThumbnail?: boolean;
}

function OrgCard({
  data,
  action,
  canViewThumbnail = true,
  badgeLabel = 'Organization',
  variant = 'elevated',
  ...cardProps
}: OrganizationListCardProps) {
  const name = data?.name;
  const avatar = extractCollection(data?.avatar);
  const totalVolume = data?.totalVolume || 0;
  const image = extractImageData(avatar);

  return (
    <Card
      {...cardProps}
      variant={variant}
      className={cardStyles({ className: cardProps.className })}
    >
      <HStack className="items-stretch">
        <Box className="aspect-square overflow-hidden">
          <SingleImageViewer disabled={!canViewThumbnail} image={image} />
        </Box>

        <Box className="w-1 bg-secondary-500" />

        <VStack space="xs" className="flex-1 p-2 pl-3">
          <Text bold className="flex-1" numberOfLines={1}>
            {name}
          </Text>

          <HStack space="xs" className="items-center">
            {totalVolume > 0 ? (
              <>
                <Icon size="sm" as={DatabaseIcon} className="text-typography-700" />
                <Text
                  size="sm"
                  className="flex-1 font-JakartaMedium text-typography-700"
                  numberOfLines={1}
                >
                  {displayVolume(totalVolume)} in stock
                </Text>
              </>
            ) : (
              <BasicBadge size="xs" text="Out of stock" variant="outline" action="muted" />
            )}
          </HStack>

          <HStack
            space="xs"
            className="items-center self-start rounded-full bg-secondary-500 px-3 py-1"
          >
            <Text size="xs" className="font-JakartaMedium text-secondary-0" numberOfLines={1}>
              {badgeLabel}
            </Text>
          </HStack>
        </VStack>

        {action}
      </HStack>
    </Card>
  );
}

function CardSkeleton() {
  return <Skeleton className="h-24" />;
}

const OrganizationListCard = OrgCard as FC<OrganizationListCardProps> & {
  Skeleton: typeof CardSkeleton;
};

OrgCard.Skeleton = CardSkeleton;
OrganizationListCard.displayName = 'HospitalListCard';

export type { OrganizationListCardProps as HospitalListCardProps };
export default OrganizationListCard;
