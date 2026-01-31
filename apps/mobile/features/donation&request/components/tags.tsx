import { useTheme } from '@/components/AppProvider/ThemeProvider';
import FastTimerIcon from '@/components/icons/FastTimerIcon';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { getUrgencyColor } from '@/lib/utils/getUrgencyAction';
import { COLLECTION_MODES, PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { formatDate } from '@lactalink/utilities/formatters';
import { isDonation } from '@lactalink/utilities/type-guards';
import { ClipboardClockIcon, DropletIcon, PackageIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';

interface BaseProps {
  isLoading?: boolean;
}

interface StorageTypeTagProps extends BaseProps {
  data?: Donation | Request;
}

export function StorageTypeTag({ data, isLoading }: StorageTypeTagProps) {
  const { themeColors } = useTheme();

  const { storage, strokeColor } = useMemo(() => {
    if (!data) return { storage: 'N/A' };

    const storageTypes = PREFERRED_STORAGE_TYPES;

    if (isDonation(data)) {
      const fillColor = themeColors.primary[50];
      const strokeColor = themeColors.primary[700];
      return {
        fillColor,
        strokeColor,
        storage: storageTypes[data.details.storageType].label,
      };
    } else {
      const fillColor = themeColors.tertiary[50];
      const strokeColor = themeColors.tertiary[700];
      return {
        fillColor,
        strokeColor,
        storage: storageTypes[data.details.storagePreference || storageTypes.EITHER.value].label,
      };
    }
  }, [data, themeColors]);

  return (
    <HStack space="sm" className="items-center">
      {isLoading ? (
        <>
          <Skeleton variant="circular" className="h-6 w-6" />
          <Skeleton variant="rounded" className="h-5 w-28" />
        </>
      ) : (
        <>
          <Card className="rounded-full border-0 p-2">
            <Icon as={PackageIcon} />
          </Card>
          <Text className="font-JakartaMedium">{storage}</Text>
        </>
      )}
    </HStack>
  );
}

interface CollectionMethodTagProps extends BaseProps {
  data?: Donation;
}

export function CollectionMethodTag({ data, isLoading }: CollectionMethodTagProps) {
  const method = COLLECTION_MODES[data?.details.collectionMode || 'MANUAL'].label;

  return (
    <HStack space="sm" className="items-center">
      {isLoading ? (
        <>
          <Skeleton variant="circular" className="h-6 w-6" />
          <Skeleton variant="rounded" className="h-5 w-28" />
        </>
      ) : (
        <>
          <Card className="rounded-full border-0 p-2">
            <Icon as={DropletIcon} />
          </Card>
          <Text className="font-JakartaMedium">{method}</Text>
        </>
      )}
    </HStack>
  );
}

interface UrgencyTagProps extends BaseProps {
  data?: Request;
}

export function UrgencyTag({ data, isLoading }: UrgencyTagProps) {
  const urgency = data?.details?.urgency || URGENCY_LEVELS.LOW.value;
  const urgencyLabel = URGENCY_LEVELS[urgency].label;

  return (
    <HStack space="sm" className="items-center">
      {isLoading ? (
        <>
          <Skeleton variant="circular" className="h-6 w-6" />
          <Skeleton variant="rounded" className="h-5 w-28" />
        </>
      ) : (
        <>
          <Card className="rounded-full border-0 p-2">
            <Icon as={FastTimerIcon} />
          </Card>
          <Text className="font-JakartaMedium">{urgencyLabel}</Text>
        </>
      )}
    </HStack>
  );
}

interface DueDateTagProps extends BaseProps {
  data?: Pick<Request, 'details'>;
}

export function DueDateTag({ data, isLoading }: DueDateTagProps) {
  const neededAt =
    data?.details?.neededAt && formatDate(data.details.neededAt, { shortMonth: true });

  const strokeColor = getUrgencyColor(data?.details.urgency || 'LOW', '700');

  return (
    <HStack space="sm" className="items-center">
      {isLoading ? (
        <>
          <Skeleton variant="circular" className="h-6 w-6" />
          <Skeleton variant="rounded" className="h-5 w-28" />
        </>
      ) : (
        <>
          <Card className="rounded-full border-0 p-2">
            <Icon as={ClipboardClockIcon} stroke={strokeColor} />
          </Card>
          <Text className="font-JakartaMedium" style={{ color: strokeColor }}>
            {neededAt}
          </Text>
        </>
      )}
    </HStack>
  );
}
