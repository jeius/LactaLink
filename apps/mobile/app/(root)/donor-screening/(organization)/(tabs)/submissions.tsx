import { AnimatedPressable } from '@/components/animated/pressable';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { InfiniteFlashList } from '@/components/ui/list';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useInfiniteSubmissions } from '@/features/donor-screening/hooks/useInfiniteSubmissions';
import { useMyOrgScreeningForm } from '@/features/donor-screening/hooks/useMyOrgScreeningForm';
import { DonorScreeningSubmission, User } from '@lactalink/types/payload-generated-types';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection, listKeyExtractor } from '@lactalink/utilities/extractors';
import { formatDate } from '@lactalink/utilities/formatters';
import { useRouter } from 'expo-router';
import { ChevronRightIcon, InboxIcon } from 'lucide-react-native';

type SubmissionEntry = Pick<
  DonorScreeningSubmission,
  'id' | 'submitterName' | 'submitterEmail' | 'isApproved' | 'isRejected' | 'submittedAt'
> & { submitter?: User | null };

export default function SubmissionsTab() {
  const { form } = useMyOrgScreeningForm();

  const { data: submissions, isRefetching, refetch, ...query } = useInfiniteSubmissions(form?.id);

  const data = submissions.map(transformData) || [];

  if (query.isLoading) return <LoadingSpinner />;

  return (
    <InfiniteFlashList
      {...query}
      data={data}
      renderItem={({ item }) => <SubmissionItem item={item} />}
      gap={8}
      refreshing={isRefetching}
      onRefresh={refetch}
      keyExtractor={listKeyExtractor}
      contentContainerClassName="p-4"
      ListEmptyComponent={<ListEmpty />}
    />
  );
}

function SubmissionItem({ item }: { item: SubmissionEntry }) {
  const router = useRouter();
  const { isApproved, isRejected, submitter } = item;
  const userProfile = submitter?.profile;

  if (isPlaceHolderData(item)) {
    return <Skeleton className="h-28 w-full rounded-2xl" />;
  }

  return (
    <AnimatedPressable
      onPress={() => router.push(`/donor-screening/submission/view/${item.id}`)}
      className="overflow-hidden rounded-2xl border border-outline-100 bg-background-0 p-4"
    >
      <HStack space="md" className="items-center">
        <Avatar size="md" action="muted" profile={userProfile} />

        <VStack space="xs" className="flex-1">
          <Text bold numberOfLines={1} className="text-typography-900">
            {item.submitterName || 'Unknown Submitter'}
          </Text>
          <Text size="sm" numberOfLines={1} className="text-typography-500">
            {item.submitterEmail || 'No email provided'}
          </Text>
          <HStack space="sm" className="items-center">
            <Badge
              size="sm"
              action={isApproved ? 'success' : isRejected ? 'error' : 'warning'}
              variant="solid"
            >
              <BadgeText>
                {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Need Review'}
              </BadgeText>
            </Badge>
            <Text size="xs" className="text-typography-400">
              {formatDate(item.submittedAt, { shortMonth: true })}
            </Text>
          </HStack>
        </VStack>

        <Icon as={ChevronRightIcon} size="sm" className="shrink-0 text-typography-400" />
      </HStack>
    </AnimatedPressable>
  );
}

function ListEmpty() {
  return (
    <VStack space="md" className="flex-1 items-center justify-center px-2 py-16">
      <Box className="rounded-full bg-background-100 p-6">
        <Icon as={InboxIcon} size="xl" className="text-typography-400" />
      </Box>
      <VStack space="xs" className="items-center">
        <Heading size="md" className="text-typography-700">
          No submissions yet
        </Heading>
        <Text size="sm" className="text-center text-typography-500">
          Submitted screening forms from donors will appear here.
        </Text>
      </VStack>
    </VStack>
  );
}

function transformData(data: DonorScreeningSubmission): SubmissionEntry {
  return {
    id: data.id,
    submitterName: data.submitterName,
    submitterEmail: data.submitterEmail,
    isApproved: data.isApproved,
    isRejected: data.isRejected,
    submittedAt: data.submittedAt,
    submitter: extractCollection(data.submittedBy),
  };
}
