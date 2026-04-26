import { BasicBadge } from '@/components/badges';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import ScrollView from '@/components/ui/ScrollView';
import SubmissionSummary from '@/features/donor-screening/components/SubmissionSummary';
import { useSubmissionActionMutation } from '@/features/donor-screening/hooks/mutations';
import { useSubmissionFormQuery } from '@/features/donor-screening/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { shadow } from '@/lib/utils/shadows';
import { DonorScreeningSubmission } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FormSubmission() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: submission, isLoading } = useSubmissionFormQuery(id);

  const { data: meUser } = useMeUser();
  const isIndividual = meUser?.profile?.relationTo === 'individuals';

  if (isLoading) return <LoadingSpinner />;

  const form = extractCollection(submission?.form);
  const submissionData = submission?.submissionData;

  if (!form || !submissionData) return null;

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <Box
        className="border-b border-outline-200 bg-background-0"
        style={{ paddingTop: insets.top, ...shadow.sm }}
      >
        {isIndividual ? (
          <DonorHeader submission={submission} />
        ) : (
          <OrganizationHeader submission={submission} />
        )}
      </Box>
      <ScrollView contentContainerClassName="px-4 py-5">
        <SubmissionSummary form={form} data={submissionData} />
      </ScrollView>
    </SafeArea>
  );
}

function DonorHeader({ submission }: { submission: DonorScreeningSubmission }) {
  const { isApproved, isRejected } = submission;
  const badgeText = isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending Review';
  return (
    <HStack space="lg" className="items-center px-2 py-1">
      <HeaderBackButton />
      <HStack space="xs" className="flex-1 items-center">
        <BasicBadge
          bold
          size="xl"
          text={badgeText}
          action={isApproved ? 'success' : isRejected ? 'error' : 'warning'}
        />
      </HStack>
    </HStack>
  );
}

function OrganizationHeader({ submission }: { submission: DonorScreeningSubmission }) {
  const { isApproved, isRejected } = submission;
  const canTakeAction = !isApproved && !isRejected;
  const badgeText = isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Need Action';

  const { mutate: executeAction, isPending } = useSubmissionActionMutation(submission.id);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const isApproving = action === 'approve' && isPending;
  const isRejecting = action === 'reject' && isPending;
  const approveLabel = isApproving ? 'Approving...' : 'Approve';
  const rejectLabel = isRejecting ? 'Rejecting...' : 'Reject';

  const handleApprove = useCallback(() => {
    setAction('approve');
    executeAction({ action: 'approve' });
  }, [executeAction]);

  const handleReject = useCallback(() => {
    executeAction({ action: 'reject' });
    setAction('reject');
  }, [executeAction]);

  return (
    <HStack space="lg" className="items-center px-2 py-1">
      <HeaderBackButton />
      <HStack
        space="xs"
        className={`flex-1 items-center ${!canTakeAction ? 'justify-start' : 'justify-end'}`}
      >
        {!canTakeAction ? (
          <BasicBadge
            bold
            size="xl"
            text={badgeText}
            action={isApproved ? 'success' : isRejected ? 'error' : 'warning'}
          />
        ) : (
          <>
            <ActionModal
              action="positive"
              triggerButtonProps={{
                label: approveLabel,
                className: 'flex-1',
                isLoading: isApproving,
              }}
              confirmButtonProps={{ label: 'Approve' }}
              title="Confirm Approve"
              description="Are you sure you want to approve this submission? This action cannot be undone."
              onConfirm={handleApprove}
            />

            <ActionModal
              action="negative"
              triggerButtonProps={{ label: rejectLabel, isLoading: isRejecting }}
              confirmButtonProps={{ label: 'Reject' }}
              title="Confirm Reject"
              description="Are you sure you want to reject this submission? This action cannot be undone."
              onConfirm={handleReject}
            />
          </>
        )}
      </HStack>
    </HStack>
  );
}
