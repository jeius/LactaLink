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

import { DonationCreateSearchParams, DonationCreateSteps } from '@/lib/types/donationRequest';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { extractErrorMessage } from '@lactalink/utilities/extractors';

import { createDonation } from '@/lib/api/donation';
import { upsertMilkBag } from '@/lib/api/upsert';
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
} & DonationCreateSearchParams;

export default function CreateDonation() {
  //#region Hooks
  const router = useRouter();

  const { matchedRequest, step } = useLocalSearchParams<SearchParams>();
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
      const createPromise = createDonation(data);

      toast.promise(createPromise, {
        loading: `Submitting donation...`,
        success: (res: { message: string }) => res.message,
        error: (error) => {
          additionalState.onRefresh?.();
          return extractErrorMessage(error);
        },
      });

      const { transaction } = await createPromise;
      const slugsToRevalidate: CollectionSlug[] = ['donations', 'notifications', 'milkBags'];

      if (transaction) {
        router.dismissTo(`/transactions/${transaction.id}`);
        slugsToRevalidate.push('requests', 'transactions');
      } else {
        router.dismissTo('/account/donations');
      }

      revalidateDonations(slugsToRevalidate);
      deleteSavedFormData('donation-create');
    },
    [additionalState, revalidateDonations, router]
  );

  const submit = handleSubmit(onSubmit);

  async function handleNext() {
    switch (step) {
      case detailsStep: {
        try {
          setValidatingDetails(true);

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

          if (!isValid) {
            throw new Error('Please fix the errors before proceeding.');
          }

          const bags = data.details.bags;
          data.milkBags = await Promise.all(bags.map(upsertMilkBag));
          revalidateDonations(['milkBags']);
          reset(data);

          if (tutorialDone) {
            skipToPage(currentPageIndex + Math.min(2, routes.length - currentPageIndex - 1));
          } else {
            nextPage();
          }
        } catch (error) {
          toast.error(extractErrorMessage(error));
          console.error('Error validating details:', error);
        } finally {
          setValidatingDetails(false);
        }

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

// #region API Functions
// async function createDonation(data: DonationCreateSchema) {
//   const apiClient = getApiClient();
//   const { details, donor, deliveryPreferences, type, milkBags } = data;

//   const { image, ...restOfDetails } = details;

//   const milkBagDocs = await Promise.all(
//     milkBags.map(async (bag) => {
//       const imageDoc = await uploadImage('milk-bag-images', bag.bagImage!);
//       return apiClient.updateByID({
//         collection: 'milkBags',
//         id: bag.id,
//         data: { bagImage: imageDoc.id },
//         depth: 0,
//         select: { volume: true, status: true },
//       });
//     })
//   ).catch((error) => {
//     console.error('Error verifying bags:', error);
//     throw error;
//   });

//   const milkImageDoc = image && (await uploadImage('images', image));
//   const volume = milkBagDocs.reduce((sum, bag) => sum + bag.volume, 0);

//   const donationDoc = await apiClient
//     .create({
//       collection: 'donations',
//       data: {
//         volume: volume,
//         remainingVolume: volume,
//         donor: donor,
//         status: DONATION_REQUEST_STATUS.AVAILABLE.value,
//         details: {
//           ...restOfDetails,
//           bags: extractID(milkBagDocs),
//           milkSample: milkImageDoc && [extractID(milkImageDoc)],
//         },
//         deliveryPreferences: extractID(deliveryPreferences),
//         recipient: type === 'DIRECT' ? data.recipient : undefined,
//       },
//     })
//     .catch(async (error) => {
//       await Promise.all([
//         deleteCollection('images', milkImageDoc?.id, { silent: true }),
//         apiClient.update({
//           collection: 'milkBags',
//           where: { id: { in: extractID(milkBagDocs) } },
//           data: { bagImage: null },
//           depth: 0,
//         }),
//       ]);

//       throw error;
//     });

//   let transaction: Transaction | undefined;
//   let message = 'Donation created successfully!';

//   try {
//     if (type === 'MATCHED') {
//       const transactionService = getTransactionService();

//       const date = new Date(data.delivery.date);
//       const time = new Date(data.delivery.time);
//       date.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);

//       transaction = await transactionService.createP2PTransaction({
//         donation: donationDoc,
//         request: extractID(data.matchedRequest),
//         milkBags: extractID(milkBagDocs),
//         delivery:
//           data.delivery.type === 'CONFIRMED'
//             ? {
//                 confirmedAt: new Date().toISOString(),
//                 address: extractID(data.delivery.address),
//                 mode: data.delivery.mode,
//                 datetime: date.toISOString(),
//               }
//             : undefined,
//       });

//       if (data.delivery.type === 'PROPOSED') {
//         transaction = await transactionService.proposeDeliveryOption(transaction.id, {
//           address: extractID(data.delivery.address),
//           mode: data.delivery.mode,
//           datetime: date.toISOString(),
//           proposedBy: { relationTo: 'individuals', value: extractID(donor) },
//         });
//       }

//       const updatedRequest = extractCollection(transaction.request);

//       const requesterName = extractCollection(updatedRequest?.requester)?.givenName || 'Requester';
//       message = `Thank you! ${requesterName} has been notified of your donation.`;
//     }
//   } catch (error) {
//     await Promise.all([
//       deleteCollection('donations', donationDoc.id, { silent: true }),
//       deleteCollection('images', milkImageDoc?.id, { silent: true }),
//       apiClient.update({
//         collection: 'milkBags',
//         where: { id: { in: extractID(milkBagDocs) } },
//         data: { bagImage: null },
//         depth: 0,
//       }),
//     ]);
//     throw error;
//   }

//   return { message, transaction: transaction };
// }

// #endregion
