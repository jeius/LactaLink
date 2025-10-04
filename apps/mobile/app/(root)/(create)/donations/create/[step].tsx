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
import { MILK_BAG_STATUS } from '@lactalink/enums';

import { DonationCreateSearchParams, DonationCreateSteps } from '@/lib/types/donationRequest';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';
import { extractImageSchema } from '@/lib/utils/extractImageSchema';

import { getApiClient, getTransactionService } from '@lactalink/api';
import { MilkBag, Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';

import { CreateMilkBagSchema, DonationSchema } from '@lactalink/form-schemas';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import isEqualWith from 'lodash/isEqualWith';
import { ReactNode, useCallback, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
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
      const slugsToRevalidate: CollectionSlug[] = ['donations', 'notifications'];

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

        const isValid = await form.trigger('details');
        if (!isValid) {
          toast.error('Please fix the errors before proceeding.');
          return;
        }

        const data = form.getValues();
        data.milkBags = await createMilkBags(data);
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
      const milkBagsError = form.formState.errors.milkBags;
      toast.error(extractErrorMessage(milkBagsError));
      throw new Error('Form validation failed');
    }
  }
  //#endregion

  //#region Render
  return (
    <>
      <FormPreventBack />

      <Stack.Screen
        options={{
          headerShown: true,
          title: DONATION_CREATE_STEPS[step]?.label || 'New Donation',
        }}
      />

      <SafeArea safeTop={false}>
        <ScrollView
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
        </ScrollView>
      </SafeArea>
    </>
  );
  //#endregion
}

// #region API Functions
async function createMilkBags(data: DonationSchema) {
  const bags = data.details.bags;
  const milkBags: DonationSchema['milkBags'] = {};

  await Promise.all(
    bags.map(async ({ quantity, groupID, ...bagData }) => {
      const docs: MilkBag[] = [];
      const existingBags = data.milkBags?.[groupID] || [];

      // Calculate how many bags to create or update
      const numOfBagsToCreate = quantity - existingBags.length;

      if (numOfBagsToCreate > 0) {
        // Create new bags
        const [createdBags, updatedBags] = await Promise.all([
          createManyMilkBags(numOfBagsToCreate, bagData),
          updateBags(existingBags, bagData),
        ]);

        docs.push(...createdBags, ...updatedBags);
      } else if (numOfBagsToCreate < 0) {
        // Delete excess bags
        const bagsToDelete = existingBags?.slice(numOfBagsToCreate);
        const remainingBags = existingBags?.slice(0, numOfBagsToCreate);

        const [_, updatedBags] = await Promise.all([
          deleteBags(bagsToDelete),
          updateBags(remainingBags, bagData),
        ]);

        docs.push(...updatedBags);
      } else {
        // No change in number of bags, just update existing ones
        const updatedBags = await updateBags(existingBags, bagData);
        docs.push(...updatedBags);
      }

      milkBags[groupID] = docs.map((bag) => ({
        ...bag,
        donor: extractID(bag.donor),
        bagImage: extractImageSchema(extractCollection(bag.bagImage)),
      }));

      return milkBags[groupID];
    })
  );

  return milkBags;
}

async function createDonation(data: DonationSchema) {
  const apiClient = getApiClient();
  const { details, donor, deliveryPreferences, recipient, milkBags, matchedRequest } = data;

  const { image, ...restOfDetails } = details;

  const milkBagDocs = await Promise.all(
    Object.values(milkBags).flatMap((bags) =>
      bags.map(async (bag) => {
        const imageDoc = await uploadImage('milk-bag-images', bag.bagImage!);
        return apiClient.updateByID({
          collection: 'milkBags',
          id: bag.id,
          data: { bagImage: imageDoc.id },
          depth: 0,
          select: { volume: true, status: true },
        });
      })
    )
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
        volume,
        remainingVolume: volume,
        donor,
        status: 'AVAILABLE',
        details: {
          ...restOfDetails,
          bags: extractID(milkBagDocs),
          milkSample: milkImageDoc && [extractID(milkImageDoc)],
        },
        deliveryPreferences: extractID(deliveryPreferences),
        recipient,
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
          select: {},
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

async function createManyMilkBags(
  quantity: number,
  bagData: Omit<CreateMilkBagSchema, 'quantity' | 'groupID'>
) {
  const apiClient = getApiClient();

  return await Promise.all(
    Array.from({ length: quantity }, async () =>
      apiClient.create({
        depth: 3,
        collection: 'milkBags',
        data: {
          ...bagData,
          status: MILK_BAG_STATUS.DRAFT.value,
          owner: { relationTo: 'individuals', value: bagData.donor },
        },
      })
    )
  );
}

async function deleteBags(bags: DonationSchema['milkBags'][string] = []): Promise<MilkBag[]> {
  const apiClient = getApiClient();
  if (!bags?.length) return [];

  return await apiClient.delete({
    collection: 'milkBags',
    where: { id: { in: extractID(bags) } },
    depth: 0,
  });
}

async function updateBags(
  bags: DonationSchema['milkBags'][string] = [],
  bagData: {
    volume: number;
    donor: string;
    collectedAt: string;
  }
): Promise<MilkBag[]> {
  const apiClient = getApiClient();
  const bagsUnchanged: DonationSchema['milkBags'][string] = [];
  const bagsToUpdate: DonationSchema['milkBags'][string] = [];

  for (const bag of bags) {
    const hasChanged = !isEqualWith(bag, bagData, (a, b) => {
      return a.donor === b.donor && a.volume === b.volume && a.collectedAt === b.collectedAt;
    });
    if (hasChanged) {
      bagsToUpdate.push(bag);
    } else {
      bagsUnchanged.push(bag);
    }
  }

  if (!bagsToUpdate?.length) {
    return bags as MilkBag[];
  }

  const updatedBags = await apiClient.update({
    collection: 'milkBags',
    where: { id: { in: extractID(bagsToUpdate) } },
    data: bagData,
    depth: 3,
  });

  return [...updatedBags, ...(bagsUnchanged as MilkBag[])];
}
// #endregion
