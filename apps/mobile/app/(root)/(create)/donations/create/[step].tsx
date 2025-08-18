import { DonationReviewCard } from '@/components/cards/DonationReviewCard';
import { DonationDetailsForm } from '@/components/forms/donation-request/DonationDetailsForm';
import MilkBagVerification from '@/components/forms/donation-request/MilkBagVerification';
import FormPreventBack from '@/components/forms/FormPreventBack';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import MilkBagVerificationTutorial from '@/components/tutorials/MilkBagVerification';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { usePagination } from '@/hooks/forms';

import { uploadImage } from '@/lib/api/file';
import { COLLECTION_QUERY_KEY, MILK_BAG_STATUS } from '@/lib/constants';
import { DONATION_CREATE_STEPS } from '@/lib/constants/donationRequest';
import { useTutorialStore } from '@/lib/stores/tutorialStore';

import { DonationCreateSearchParams, DonationCreateSteps } from '@/lib/types/donationRequest';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { getApiClient } from '@lactalink/api';
import { DonationSchema, MilkBag, MilkBagsSelect } from '@lactalink/types';
import { extractErrorMessage, extractID } from '@lactalink/utilities';
import { useQueryClient } from '@tanstack/react-query';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ReactNode, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

const routes = createDynamicRoute('/donations/create', Object.keys(DONATION_CREATE_STEPS));

const detailsStep = DONATION_CREATE_STEPS.details.value;
const tutorialStep = DONATION_CREATE_STEPS['milkbag-tutorial'].value;
const verificationStep = DONATION_CREATE_STEPS['milkbag-verification'].value;

const buttonTextMap: Record<DonationCreateSteps, string> = {
  [detailsStep]: 'Verify Milk Bags',
  [tutorialStep]: 'Proceed to Verification',
  [verificationStep]: 'Submit',
};

export default function CreateDonation() {
  //#region Hooks
  const router = useRouter();
  const queryClient = useQueryClient();

  const { matchedRequest: matchedRequestID, step } =
    useLocalSearchParams<DonationCreateSearchParams>();
  const { nextPage, skipToPage, currentPageIndex, hasNextPage } = usePagination(routes);

  const { completed: tutorialDone } = useTutorialStore((s) => s.donation);
  const setDonationTutorialState = useTutorialStore((s) => s.setDonationState);

  const form = useFormContext<DonationSchema>();
  //#endregion

  //#region Form State
  const formData = form.getValues();
  const isSubmitting = form.formState.isSubmitting;
  // #endregion

  const renderFormMap: Record<DonationCreateSteps, ReactNode> = {
    [detailsStep]: <DonationDetailsForm matchedRequest={matchedRequestID} />,
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

      router.replace('/map/explore');
    },
    [router, queryClient]
  );

  const submit = form.handleSubmit(onSubmit);

  async function handleNext() {
    switch (step) {
      case detailsStep: {
        const isValid = await form.trigger('details');
        if (!isValid) {
          toast.error('Please fix the errors before proceeding.');
          return;
        }

        const updatedData = await createMilkBags(formData);
        form.reset(updatedData);

        if (tutorialDone) {
          skipToPage(currentPageIndex + Math.min(2, routes.length - currentPageIndex - 1));
        } else {
          nextPage();
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

  console.log('Current Step:', step);

  async function handleValidation() {
    const isValid = await form.trigger();
    if (!isValid) {
      throw new Error('Form validation failed');
    }
  }
  //#endregion

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
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack space="lg">
            {renderFormMap[step]}

            <Box className="mx-5">
              {hasNextPage ? (
                <Button onPress={handleNext}>
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
}

async function createMilkBags(data: DonationSchema) {
  const apiClient = getApiClient();

  const bags = data.details.bags;
  const milkBags: DonationSchema['milkBags'] = {};

  const defaultSelect: MilkBagsSelect = {
    donor: true,
    volume: true,
    status: true,
    code: true,
    bagImage: true,
    collectedAt: true,
  };

  await Promise.all(
    bags.map(async ({ quantity, groupID, ...bagData }) => {
      const docs: MilkBag[] = [];
      const bagsToUpdate = data.milkBags[groupID];

      if (bagsToUpdate?.length) {
        const updatedBags = await apiClient.update({
          collection: 'milkBags',
          where: { id: { in: extractID(bagsToUpdate) } },
          data: bagData,
          select: defaultSelect,
        });

        docs.push(...updatedBags);
      } else {
        for (let i = 0; i < quantity; i++) {
          const milkBagDoc = await apiClient.create({
            depth: 3,
            collection: 'milkBags',
            data: {
              ...bagData,
              status: MILK_BAG_STATUS.DRAFT.value,
              owner: { relationTo: 'individuals', value: data.donor },
            },
            select: defaultSelect,
          });

          docs.push(milkBagDoc);
        }
      }

      milkBags[groupID] = docs.map((bag) => ({
        ...bag,
        donor: extractID(bag.donor),
        bagImage: null, // Set null, since draft milk bags does not have an image
      }));
    })
  );

  data.milkBags = milkBags;

  return data;
}

async function createDonation(data: DonationSchema) {
  const apiClient = getApiClient();
  const { details, donor, deliveryPreferences, recipient, milkBags } = data;

  const { image, ...restOfDetails } = details;

  console.log('Creating donation with data:', data);

  const milkBagIDs = Object.values(milkBags).flatMap((bags) => extractID(bags));

  const milkImageDoc = image && (await uploadImage('images', image));

  try {
    const donationDoc = await apiClient.create({
      collection: 'donations',
      data: {
        donor,
        status: 'AVAILABLE',
        details: {
          ...restOfDetails,
          bags: milkBagIDs,
          milkSample: milkImageDoc && [extractID(milkImageDoc)],
        },
        deliveryPreferences,
        recipient,
      },
    });
  } catch (error) {
    if (milkImageDoc) {
      await apiClient.deleteByID({
        collection: 'images',
        id: extractID(milkImageDoc),
      });
    }
  }

  return {
    message: 'Donation created successfully!',
  };
}
