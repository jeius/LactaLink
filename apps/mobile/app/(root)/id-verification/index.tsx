import { BasicBadge, BasicBadgeProps } from '@/components/badges';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useIdentityQuery } from '@/features/id-verification/hooks/useIdentity';
import { getSavedFormData } from '@/lib/localStorage/utils';
import { ID_STATUS, ID_TYPES } from '@lactalink/enums';
import { IDStatus } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';
import { formatDate } from '@lactalink/utilities/formatters';
import { Link, Redirect } from 'expo-router';
import { IdCardIcon, UserIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PENDING_STATUSES: string[] = [ID_STATUS.PENDING.value, ID_STATUS.REQUIRED_ACTION.value];
const APPROVED = ID_STATUS.APPROVED.value;

export default function IDVerificationOverview() {
  const insets = useSafeAreaInsets();

  const { data: identity, isLoading, refetch, isRefetching } = useIdentityQuery();

  const savedData = useMemo(() => getSavedFormData('identity-create'), []);

  if (isLoading) return <LoadingSpinner />;

  if (!identity) {
    if (!savedData) return <Redirect href="/id-verification/onboarding" />;
    else return <Redirect href="/id-verification/id-type" />;
  }

  const { status } = identity;

  const idDetails = {
    'ID No.': identity.idNumber,
    'Date Issued': identity.issueDate ? formatDate(identity.issueDate) : '-',
    'Date Expires': identity.expirationDate ? formatDate(identity.expirationDate) : '-',
  };

  const personalInfo = {
    'Given Name': identity.givenName,
    'Middle Name': identity.middleName || '-',
    'Family Name': identity.familyName,
    Suffix: identity.suffix || '-',
    Birthdate: identity.birth ? formatDate(identity.birth) : '-',
    Address: identity.address || '-',
  };

  const statusBadge: Record<IDStatus, BasicBadgeProps['action']> = {
    [ID_STATUS.PENDING.value]: 'warning',
    [ID_STATUS.REQUIRED_ACTION.value]: 'warning',
    [ID_STATUS.APPROVED.value]: 'info',
    [ID_STATUS.REJECTED.value]: 'error',
  };

  if (PENDING_STATUSES.includes(identity.status)) {
    return <Redirect href="/id-verification/offboarding" />;
  }

  return (
    <Box className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="p-5 flex-col gap-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <HStack space="sm" className="items-center">
          <Text bold size="lg">
            Status:
          </Text>
          <BasicBadge action={statusBadge[status]} size="lg" text={ID_STATUS[status].label} />
        </HStack>

        <Card className="flex-col gap-2">
          <HStack space="sm" className="items-center">
            <Icon as={UserIcon} />
            <Text bold>Personal Information</Text>
          </HStack>
          {Object.entries(personalInfo).map(([key, value]) => (
            <HStack key={key} space="xs" className="items-start">
              <Text>{key}:</Text>
              <Text className="shrink font-JakartaMedium" numberOfLines={3}>
                {value}
              </Text>
            </HStack>
          ))}
        </Card>

        <Card className="flex-col gap-2">
          <HStack space="sm" className="items-center">
            <Icon size="xl" as={IdCardIcon} />
            <Text bold>{ID_TYPES[identity.idType].label}</Text>
          </HStack>
          {Object.entries(idDetails).map(([key, value]) => (
            <HStack key={key} space="xs" className="items-center">
              <Text>{key}:</Text>
              <Text className="shrink font-JakartaMedium">{value}</Text>
            </HStack>
          ))}
        </Card>
      </ScrollView>

      <Card style={{ paddingBottom: insets.bottom + 12 }} className="rounded-3xl p-4">
        <Link
          asChild
          href={{ pathname: '/id-verification/id-type', params: { id: extractID(identity) } }}
        >
          <Button>
            <ButtonText>
              {status === APPROVED ? 'Update Identity' : 'Resubmit Verification'}
            </ButtonText>
          </Button>
        </Link>
      </Card>
    </Box>
  );
}
