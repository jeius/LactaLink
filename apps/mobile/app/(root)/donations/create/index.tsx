import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { DONATION_CREATE_STEPS } from '@/features/donation&request/lib/constants';
import { DonationCreateParams } from '@/features/donation&request/lib/types';
import ScreeningApplicatonScreen from '@/features/donor-screening/components/screens/ScreeningApplicationScreen';
import {
  useApprovedSubmissionByUserQuery,
  useOrganizationScreeningFormQuery,
  useStandardScreeningFormQuery,
} from '@/features/donor-screening/hooks/queries';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { getMeUser } from '@/lib/stores/meUserStore';
import { PopulatedUserProfile, UserProfile } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';
import { Href, Redirect, useLocalSearchParams } from 'expo-router';

export default function CreatePageRedirect() {
  const params = useLocalSearchParams<DonationCreateParams>();
  const recipientId = params.rid;
  const recipientSlug = params.rslg;

  const { data: recipient, isLoading } = useProfileData(
    recipientId && recipientSlug ? { relationTo: recipientSlug, value: recipientId } : null
  );

  if (isLoading) return <LoadingSpinner />;

  const firstStep = DONATION_CREATE_STEPS.details.value;
  const redirectHref: Href = { pathname: `./${firstStep}`, params };

  if (recipientSlug === 'hospitals' || recipientSlug === 'milkBanks') {
    return (
      <CheckPassedOnOrgScreening
        organization={recipient as Exclude<PopulatedUserProfile, { relationTo: 'individuals' }>}
        redirect={redirectHref}
      />
    );
  }

  return <CheckPassedStandardScreening redirect={redirectHref} />;
}

type CheckPassedScreeningProps = {
  organization: Exclude<UserProfile, { relationTo: 'individuals' }>;
  redirect: Href;
};

function CheckPassedOnOrgScreening({ organization, redirect }: CheckPassedScreeningProps) {
  const { data: screeningForm, ...screeningFormQuery } = useOrganizationScreeningFormQuery({
    organization,
    _status: 'published',
  });

  const { data: submission, ...submissionQuery } = useApprovedSubmissionByUserQuery({
    formID: screeningForm?.id,
    userID: extractID(getMeUser()),
  });

  const isLoading = screeningFormQuery.isLoading || submissionQuery.isLoading;

  if (isLoading || submission === undefined) return <LoadingSpinner />;

  if (screeningForm && (submission === null || !submission.isApproved)) {
    return <ScreeningApplicatonScreen form={screeningForm} organization={organization} />;
  }

  return <Redirect href={redirect} relativeToDirectory />;
}

function CheckPassedStandardScreening({
  redirect,
}: Omit<CheckPassedScreeningProps, 'organization'>) {
  const { data: screeningForm, ...screeningFormQuery } = useStandardScreeningFormQuery();

  const { data: submission, ...submissionQuery } = useApprovedSubmissionByUserQuery({
    userID: extractID(getMeUser()),
  });

  const isLoading = screeningFormQuery.isLoading || submissionQuery.isLoading;

  if (isLoading || submission === undefined) return <LoadingSpinner />;

  if (screeningForm && (submission === null || !submission.isApproved)) {
    return <ScreeningApplicatonScreen form={screeningForm} />;
  }

  return <Redirect href={redirect} relativeToDirectory />;
}
