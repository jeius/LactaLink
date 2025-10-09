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
import { deleteCollection } from '@/lib/api/delete';

import { uploadImage } from '@/lib/api/file';
import { DONATION_CREATE_STEPS } from '@/lib/constants/donationRequest';
import { donationStorage } from '@/lib/localStorage';
import { useTutorialStore } from '@/lib/stores/tutorialStore';
import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';

import { DonationCreateSearchParams, DonationCreateSteps } from '@/lib/types/donationRequest';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { getApiClient, getTransactionService } from '@lactalink/api';
import { MilkBag, Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';

import { transformToMilkBagShema } from '@/lib/utils/transformData';
import { CreateMilkBagSchema, DonationSchema, MilkBagSchema } from '@lactalink/form-schemas';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import isEqual from 'lodash/isEqual';
import { ReactNode, useCallback, useState } from 'react';
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

  const form = useForm<DonationSchema>();
  const additionalFormState = form.additionalState;
  const [isValidatingDetails, setValidatingDetails] = useState(false);
  //#endregion

  //#region Form State
  const formData = form.getValues();
  const isSubmitting = form.formState.isSubmitting;
  // #endregion

  const renderFormMap: Record<DonationCreateSteps, ReactNode> = {
    [detailsStep]: (
      <DonationDetailsForm disableFields={isValidatingDetails} matchedRequest={matchedRequest} />
    ),
    [tutorialStep]: <MilkBagVerificationTutorial />,
    [verificationStep]: <MilkBagVerification />,
  };

  //#region Handlers
  const onSubmit = useCallback(
    async (data: DonationSchema) => {
      const createPromise = createDonation(data);

      toast.promise(createPromise, {
        loading: `Submitting donation...`,
        success: (res: { message: string }) => {
          donationStorage.clearAll();
          return res.message;
        },
        error: (error) => extractErrorMessage(error),
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
    },
    [revalidateDonations, router]
  );

  const submit = form.handleSubmit(onSubmit);

  async function handleNext() {
    switch (step) {
      case detailsStep: {
        setValidatingDetails(true);

        const detailsValid = await form.trigger('details');
        const donorValid = await form.trigger('donor');
        const deliveryPreferencesValid = await form.trigger('deliveryPreferences');
        const isValid = detailsValid && donorValid && deliveryPreferencesValid;

        if (!isValid) {
          toast.error('Please fix the errors before proceeding.');
          return;
        }

        const data = form.getValues();
        const bags = data.details.bags;
        data.milkBags = await Promise.all(bags.map(upsertMilkBag));
        revalidateDonations(['milkBags']);
        form.reset(data);

        if (tutorialDone) {
          skipToPage(currentPageIndex + Math.min(2, routes.length - currentPageIndex - 1));
        } else {
          nextPage();
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
    const isValid = await form.trigger();

    if (!isValid) {
      const milkBagsError = form.getFieldState('milkBags').error;
      toast.error(extractErrorMessage(milkBagsError));
      throw new Error('Form validation failed');
    }
  }
  //#endregion

  //#region Render
  return (
    <>
      <FormPreventBack />

      <SafeArea safeTop={false}>
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerClassName="grow pb-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={additionalFormState.refreshing}
              onRefresh={additionalFormState.onRefresh}
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
async function createDonation(data: DonationSchema) {
  const apiClient = getApiClient();
  const { details, donor, deliveryPreferences, recipient, milkBags, matchedRequest } = data;

  const { image, ...restOfDetails } = details;

  const milkBagDocs = await Promise.all(
    milkBags.map(async (bag) => {
      const imageDoc = await uploadImage('milk-bag-images', bag.bagImage!);
      return apiClient.updateByID({
        collection: 'milkBags',
        id: bag.id,
        data: { bagImage: imageDoc.id },
        depth: 0,
        select: { volume: true, status: true },
      });
    })
  ).catch((error) => {
    console.error('Error verifying bags:', error);
    throw error;
  });

  const milkImageDoc = image && (await uploadImage('images', image));
  const volume = milkBagDocs.reduce((sum, bag) => sum + bag.volume, 0);

  const donationDoc = await apiClient
    .create({
      collection: 'donations',
      data: {
        volume: volume,
        remainingVolume: volume,
        donor: donor,
        status: DONATION_REQUEST_STATUS.AVAILABLE.value,
        details: {
          ...restOfDetails,
          bags: extractID(milkBagDocs),
          milkSample: milkImageDoc && [extractID(milkImageDoc)],
        },
        deliveryPreferences: extractID(deliveryPreferences),
        recipient: recipient,
      },
    })
    .catch(async (error) => {
      await Promise.all([
        deleteCollection('images', milkImageDoc?.id, { silent: true }),
        apiClient.update({
          collection: 'milkBags',
          where: { id: { in: extractID(milkBagDocs) } },
          data: { bagImage: null },
          depth: 0,
        }),
      ]);

      throw error;
    });

  let transaction: Transaction | undefined;
  let message = 'Donation created successfully!';

  if (matchedRequest) {
    const transactionService = getTransactionService();
    transaction = await transactionService.createP2PTransaction({
      donation: donationDoc,
      request: matchedRequest.id,
      milkBags: extractID(milkBagDocs),
    });

    const updatedRequest = extractCollection(transaction.request);

    const requesterName = extractCollection(updatedRequest?.requester)?.givenName || 'Requester';
    message = `Thank you! ${requesterName} has been notified of your donation.`;
  }

  return { message, transaction: transaction };
}

async function upsertMilkBag(bag: CreateMilkBagSchema): Promise<MilkBagSchema> {
  const apiClient = getApiClient();
  let doc: MilkBag | undefined;
  const { id, ...rest } = bag;

  if (id) {
    const currentBag = await apiClient.findByID({
      collection: 'milkBags',
      id,
      depth: 3,
    });

    const { donor, volume, collectedAt } = transformToMilkBagShema(currentBag);

    const areEqual = isEqual(rest, { donor, volume, collectedAt });

    if (!areEqual) {
      doc = await apiClient.updateByID({
        collection: 'milkBags',
        id,
        data: rest,
        depth: 3,
      });
    } else {
      doc = currentBag;
    }
  } else {
    doc = await apiClient.create({
      collection: 'milkBags',
      depth: 3,
      data: {
        ...rest,
        status: MILK_BAG_STATUS.DRAFT.value,
        owner: { relationTo: 'individuals', value: bag.donor },
      },
    });
  }

  return transformToMilkBagShema(doc);
}
// #endregion
