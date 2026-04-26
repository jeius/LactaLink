import { AnimatedPressable } from '@/components/animated/pressable';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { InfiniteFlashList } from '@/components/ui/list';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMySubmissionsInfQuery } from '@/features/donor-screening/hooks/queries';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { DonorScreeningSubmission } from '@lactalink/types/payload-generated-types';
import { extractCollection, listKeyExtractor } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import {
  Building2Icon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  ClockIcon,
  FileEditIcon,
  HospitalIcon,
  XCircleIcon,
} from 'lucide-react-native';

type SubmissionStatus = 'approved' | 'rejected' | 'pending' | 'draft';

function getSubmissionStatus(submission: DonorScreeningSubmission): SubmissionStatus {
  if (submission.isApproved) return 'approved';
  if (submission.isRejected) return 'rejected';
  if (submission._status === 'draft') return 'draft';
  return 'pending';
}

const STATUS_CONFIG = {
  approved: {
    bannerBg: 'bg-success-700',
    bannerText: 'text-white',
    label: 'Approved',
    icon: CheckCircleIcon,
  },
  rejected: {
    bannerBg: 'bg-error-700',
    bannerText: 'text-white',
    label: 'Rejected',
    icon: XCircleIcon,
  },
  pending: {
    bannerBg: 'bg-warning-600',
    bannerText: 'text-white',
    label: 'Pending Review',
    icon: ClockIcon,
  },
  draft: {
    bannerBg: 'bg-background-200',
    bannerText: 'text-typography-500',
    label: 'Draft',
    icon: FileEditIcon,
  },
} as const;

export default function MySubmissionsScreen() {
  const { data: submissions, error, refetch, isRefetching, ...query } = useMySubmissionsInfQuery();

  useErrorBoundary(error);

  return (
    <SafeArea safeTop={false} className="items-stretch justify-start">
      <InfiniteFlashList
        {...query}
        data={submissions}
        keyExtractor={listKeyExtractor}
        contentContainerClassName="p-4 grow"
        refreshing={isRefetching}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <Box className="h-3" />}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, isPlaceholder }) => {
          if (isPlaceholder) return <Skeleton className="h-28" />;
          return <RenderItem submission={item} />;
        }}
      />
    </SafeArea>
  );
}

function RenderItem({ submission }: { submission: DonorScreeningSubmission }) {
  const router = useRouter();

  const status = getSubmissionStatus(submission);
  const { bannerBg, bannerText, label, icon: StatusIcon } = STATUS_CONFIG[status];

  const form = extractCollection(submission.form);
  const formTitle = form?.title || 'Screening Form';
  const org = form?.organization;
  const isHospital = org?.relationTo === 'hospitals';
  const orgValue = org ? extractCollection(org.value) : undefined;
  const orgName = orgValue?.displayName ?? orgValue?.name;

  return (
    <AnimatedPressable
      className="overflow-hidden rounded-2xl border border-outline-100"
      onPress={() => router.push(`/donor-screening/submission/view/${submission.id}`)}
    >
      <VStack className="pointer-events-none bg-background-0">
        {/* Status Banner */}
        <HStack space="xs" className={`items-center px-4 py-2 ${bannerBg}`}>
          <Icon as={StatusIcon} className={bannerText} style={{ width: 13, height: 13 }} />
          <Text size="xs" className={`font-JakartaSemiBold ${bannerText}`}>
            {label}
          </Text>
        </HStack>

        {/* Card Body */}
        <HStack space="md" className="items-center p-4">
          <Box className={`rounded-xl p-3 ${isHospital ? 'bg-secondary-50' : 'bg-info-50'}`}>
            <Icon
              as={isHospital ? HospitalIcon : Building2Icon}
              className={isHospital ? 'text-secondary-600' : 'text-info-600'}
              style={{ width: 24, height: 24 }}
            />
          </Box>

          <VStack space="xs" className="flex-1">
            <Text bold numberOfLines={2} className="text-typography-900">
              {formTitle}
            </Text>
            {orgName && (
              <Text size="sm" numberOfLines={1} className="text-typography-600">
                {orgName}
              </Text>
            )}
            {org && (
              <Box
                className={`self-start rounded-full px-2 py-0.5 ${isHospital ? 'bg-secondary-100' : 'bg-info-100'}`}
              >
                <Text
                  size="xs"
                  className={`font-JakartaSemiBold ${isHospital ? 'text-secondary-700' : 'text-info-700'}`}
                >
                  {isHospital ? 'Hospital' : 'Milk Bank'}
                </Text>
              </Box>
            )}
          </VStack>

          <Icon as={ChevronRightIcon} className="shrink-0 text-typography-400" />
        </HStack>
      </VStack>
    </AnimatedPressable>
  );
}

function EmptyState() {
  return (
    <VStack space="sm" className="flex-1 items-center justify-center py-16">
      <Box className="rounded-full bg-background-100 p-5">
        <Icon
          as={ClipboardListIcon}
          className="text-typography-400"
          style={{ width: 40, height: 40 }}
        />
      </Box>
      <Heading size="md" className="text-center text-typography-600">
        No submissions yet
      </Heading>
      <Text size="sm" className="text-center text-typography-400">
        Your submitted screening forms will appear here.
      </Text>
    </VStack>
  );
}
