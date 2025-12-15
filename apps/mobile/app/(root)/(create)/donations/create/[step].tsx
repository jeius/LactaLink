import { DonationReviewCard } from '@/components/cards/DonationReviewCard';
import { useForm } from '@/components/contexts/FormProvider';
import { DonationDetailsForm } from '@/components/forms/donation-request/DonationDetailsForm';
import MilkBagVerification from '@/components/forms/donation-request/MilkBagVerification';
import FormPreventBack from '@/components/forms/FormPreventBack';
import { ActionModal } from '@/components/modals';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import MilkBagVerificationTutorial from '@/components/tutorials/MilkBagVerification';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { usePagination } from '@/hooks/forms';

import { DONATION_CREATE_STEPS } from '@/lib/constants/donationRequest';
import { useTutorialStore } from '@/lib/stores/tutorialStore';

import { DonationCreateParams, DonationCreateSteps } from '@/lib/types/donationRequest';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { extractErrorMessage } from '@lactalink/utilities/extractors';

import { createDonation } from '@/lib/api/donation';
import { deleteSavedFormData } from '@/lib/localStorage/utils';
import { DonationCreateSchema } from '@lactalink/form-schemas';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReactNode, useCallback, useState } from 'react';
import { FieldPath } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { toast } from 'sonner-native';

const routes = createDynamicRoute('/donations/create', Object.keys(DONATION_CREATE_STEPS));

const detailsStep = DONATION_CREATE_STEPS.details.value;
const tutorialStep = DONATION_CREATE_STEPS['milkbag-tutorial'].value;
const verificationStep = DONATION_CREATE_STEPS['milkbag-verification'].value;

const buttonTextMap: Record<DonationCreateSteps, string> = {
  [detailsStep]: 'Verify Milk Bags',
  [tutorialStep]: 'Start Verification',
  [verificationStep]: 'Submit',
};

type SearchParams = {
  step: DonationCreateSteps;
} & DonationCreateParams;

export default function CreateDonation() {
  //#region Hooks
  const router = useRouter();

  const { mrid: matchedRequest, step } = useLocalSearchParams<SearchParams>();
  const { nextPage, skipToPage, currentPageIndex, hasNextPage } = usePagination(routes);
  const revalidateDonations = useRevalidateCollectionQueries();

  const { completed: tutorialDone } = useTutorialStore((s) => s.donation);
  const setDonationTutorialState = useTutorialStore((s) => s.setters.setDonationState);

  const { getValues, additionalState, formState, getFieldState, trigger, handleSubmit, reset } =
    useForm<DonationCreateSchema>();

  const [isValidatingDetails, setValidatingDetails] = useState(false);
  //#endregion

  //#region Form State
  const formData = getValues();
  const isSubmitting = formState.isSubmitting;
  // #endregion

  const renderFormMap: Record<DonationCreateSteps, ReactNode> = {
    [detailsStep]: (
      <DonationDetailsForm disableFields={isValidatingDetails} isMatched={!!matchedRequest} />
    ),
    [tutorialStep]: <MilkBagVerificationTutorial />,
    [verificationStep]: <MilkBagVerification />,
  };

  //#region Handlers
  const onSubmit = useCallback(
    async (data: DonationCreateSchema) => {
      const createPromise = createDonation(data).then(({ transaction }) => {
        const slugsToRevalidate: CollectionSlug[] = ['donations', 'notifications', 'milkBags'];

        if (transaction) {
          router.dismissTo(`/transactions/${transaction.id}`);
          slugsToRevalidate.push('requests', 'transactions');
        } else {
          router.dismissTo('/account/donations');
        }

        revalidateDonations(slugsToRevalidate);
        deleteSavedFormData('donation-create');
      });

      toast.promise(createPromise, {
        loading: `Submitting donation...`,
        success: (res: { message: string }) => res.message,
        error: (error) => extractErrorMessage(error),
      });
    },
    [revalidateDonations, router]
  );

  const submit = handleSubmit(onSubmit);

  async function handleNext() {
    switch (step) {
      case detailsStep: {
        setValidatingDetails(true);

        try {
          const data = getValues();

          const fieldsToValidate: FieldPath<DonationCreateSchema>[] = [
            'details',
            'donor',
            'deliveryPreferences',
          ];

          if (data.type === 'MATCHED') {
            fieldsToValidate.push('matchedRequest');
            fieldsToValidate.push('delivery');
          }

          if (data.type === 'DIRECT') {
            fieldsToValidate.push('recipient');
          }

          const isValid = await trigger(fieldsToValidate);
          if (!isValid) toast.error('Please fix the errors before proceeding.');

          if (tutorialDone) {
            skipToPage(currentPageIndex + Math.min(2, routes.length - currentPageIndex - 1));
          } else {
            nextPage();
          }
        } catch (error) {
          toast.error(extractErrorMessage(error));
          console.error('Error validating details:', error);
        }

        setValidatingDetails(false);
        return;
      }

      case tutorialStep:
        setDonationTutorialState({ completed: true });
        nextPage();
        return;

      default:
        return;
    }
  }

  async function handleValidation() {
    const isValid = await trigger();

    if (!isValid) {
      console.log('Form validation errors:', formState.errors);
      const milkBagsError = getFieldState('milkBags').error;
      toast.error(extractErrorMessage(milkBagsError));
      throw new Error('Form validation failed');
    }
  }
  //#endregion

  //#region Render
  return (
    <>
      <FormPreventBack />

      <SafeArea safeTop={false} className="items-stretch">
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerClassName="grow pb-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={additionalState.refreshing}
              onRefresh={additionalState.onRefresh}
            />
          }
        >
          <VStack space="lg" className="flex-1 items-stretch justify-between">
            {renderFormMap[step]}

            <Box className="mx-5">
              {hasNextPage ? (
                <Button disabled={isValidatingDetails} onPress={handleNext}>
                  {isValidatingDetails && <ButtonSpinner />}
                  <ButtonText>{buttonTextMap[step]}</ButtonText>
                </Button>
              ) : (
                <ActionModal
                  triggerLabel="Submit"
                  action="primary"
                  onTriggerPress={handleValidation}
                  onConfirm={submit}
                  isDisabled={isSubmitting}
                  title="Review Donation"
                  modalSize="lg"
                  description={
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      className="border-outline-200"
                      style={{
                        maxHeight: 380,
                        borderTopWidth: 1,
                        borderBottomWidth: 1,
                      }}
                    >
                      <DonationReviewCard data={formData} variant="ghost" className="p-2" />
                    </ScrollView>
                  }
                />
              )}
            </Box>
          </VStack>
        </KeyboardAwareScrollView>
      </SafeArea>
    </>
  );
  //#endregion
}
