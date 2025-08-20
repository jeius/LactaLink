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
import { usePagination } from '@/hooks/forms';

import { uploadImage } from '@/lib/api/file';
import { COLLECTION_QUERY_KEY, MILK_BAG_STATUS } from '@/lib/constants';
import { DONATION_CREATE_STEPS } from '@/lib/constants/donationRequest';
import { useTutorialStore } from '@/lib/stores/tutorialStore';

import { DonationCreateSearchParams, DonationCreateSteps } from '@/lib/types/donationRequest';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { getApiClient } from '@lactalink/api';
import { CreateMilkBagSchema, DonationSchema, MilkBag, MilkBagsSelect } from '@lactalink/types';
import { extractErrorMessage, extractID } from '@lactalink/utilities';
import { useQueryClient } from '@tanstack/react-query';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { isEqualWith } from 'lodash';
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

const defaultMilkBagSelect: MilkBagsSelect = {
  donor: true,
  volume: true,
  status: true,
  code: true,
  bagImage: true,
  collectedAt: true,
};

export default function CreateDonation() {
  //#region Hooks
  const router = useRouter();
  const queryClient = useQueryClient();

  const { matchedRequest: matchedRequestID, step } =
    useLocalSearchParams<DonationCreateSearchParams>();
  const { nextPage, skipToPage, currentPageIndex, hasNextPage } = usePagination(routes);

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
      <DonationDetailsForm disableFields={isValidatingDetails} matchedRequest={matchedRequestID} />
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
          return res.message;
        },
        error: (error) => extractErrorMessage(error),
      });

      await createPromise;

      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEY,
      });

      router.dismissTo('/account/donations');
    },
    [router, queryClient]
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
          title: DONATION_CREATE_STEPS[step]?.label || 'Create Donation',
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
                  description={
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      className="border-outline-200"
                      style={{ maxHeight: 380, borderTopWidth: 1, borderBottomWidth: 1 }}
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
  const apiClient = getApiClient();

  const bags = data.details.bags;
  const milkBags = data.milkBags;

  await Promise.all(
    bags.map(async ({ quantity, groupID, ...bagData }) => {
      const docs: MilkBag[] = [];
      const existingBags = data.milkBags[groupID];

      // Calculate how many bags to create or update
      const numOfBagsToCreate = quantity - (existingBags?.length || 0);

      if (numOfBagsToCreate > 0) {
        // Create new bags
        const createdBags = await createManyMilkBags(numOfBagsToCreate, bagData);
        const updatedBags = await updateBags(existingBags);

        docs.push(...createdBags, ...updatedBags);
      } else if (numOfBagsToCreate < 0) {
        // Delete excess bags
        const bagsToDelete = existingBags?.slice(numOfBagsToCreate);
        const remainingBags = existingBags?.slice(0, numOfBagsToCreate);

        const [_, updatedBags] = await Promise.all([
          deleteBags(bagsToDelete),
          updateBags(remainingBags),
        ]);

        docs.push(...updatedBags);
      } else {
        // No change in number of bags, just update existing ones
        const updatedBags = await updateBags(existingBags);
        docs.push(...updatedBags);
      }

      milkBags[groupID] = docs.map((bag) => ({
        ...bag,
        donor: extractID(bag.donor),
        bagImage: null, // Set null, since draft milk bags does not have an image
      }));

      async function deleteBags(bags: typeof existingBags = []): Promise<MilkBag[]> {
        if (!bags?.length) return [];

        return await apiClient.delete({
          collection: 'milkBags',
          where: { id: { in: extractID(bags) } },
          depth: 0,
        });
      }

      async function updateBags(bags: typeof existingBags = []): Promise<MilkBag[]> {
        const bagsUnchanged: typeof existingBags = [];
        const bagsToUpdate: typeof existingBags = [];

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
          select: defaultMilkBagSelect,
        });

        return [...updatedBags, ...(bagsUnchanged as MilkBag[])];
      }
    })
  );

  return milkBags;
}

async function createDonation(data: DonationSchema) {
  const apiClient = getApiClient();
  const { details, donor, deliveryPreferences, recipient, milkBags } = data;

  const { image, ...restOfDetails } = details;

  console.log('Creating donation with data:', data);

  const milkBagDocs = await Promise.all(
    Object.values(milkBags).flatMap((bags) =>
      bags.map(async (bag) => {
        const imageDoc = await uploadImage('milk-bag-images', bag.bagImage!);
        return apiClient.updateByID({
          collection: 'milkBags',
          id: bag.id,
          data: { bagImage: imageDoc.id },
          depth: 3,
          select: defaultMilkBagSelect,
        });
      })
    )
  ).catch((error) => {
    console.error('Error verifying bags:', error);
    throw error;
  });

  const milkImageDoc = image && (await uploadImage('images', image));

  try {
    const donationDoc = await apiClient.create({
      collection: 'donations',
      data: {
        donor,
        status: 'AVAILABLE',
        details: {
          ...restOfDetails,
          bags: extractID(milkBagDocs),
          milkSample: milkImageDoc && [extractID(milkImageDoc)],
        },
        deliveryPreferences,
        recipient,
      },
    });
  } catch (error) {
    await Promise.all([
      async () => {
        if (milkImageDoc) {
          await apiClient.deleteByID({
            collection: 'images',
            id: extractID(milkImageDoc),
          });
        }
      },
      apiClient.update({
        collection: 'milkBags',
        where: { id: { in: extractID(milkBagDocs) } },
        data: { bagImage: null },
        depth: 3,
        select: defaultMilkBagSelect,
      }),
    ]);

    throw error;
  }

  return {
    message: 'Donation created successfully!',
  };
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
        select: defaultMilkBagSelect,
      })
    )
  );
}
// #endregion
