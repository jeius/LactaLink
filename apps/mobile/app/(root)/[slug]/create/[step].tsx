import { DeliveryDetailsForm } from '@/components/forms/donation-request/DeliveryDetailsForm';
import { DonationDetailsForm } from '@/components/forms/donation-request/DonationDetailsForm';
import { RequestDetailsForm } from '@/components/forms/donation-request/RequestDetailsForm';
import { DonationReview } from '@/components/forms/donation-request/review/DonationReview';
import { RequestReview } from '@/components/forms/donation-request/review/RequestReview';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';

import { usePagination } from '@/hooks/forms/usePagination';
import { uploadImage } from '@/lib/api/file';
import { upsertDeliveryPreferences } from '@/lib/api/upsert';

import { DONATION_REQUEST_DETAILS, DONATION_REQUEST_STEPS } from '@/lib/constants/donationRequest';
import {
  DonationRequestFields,
  DonationRequestParams,
  DonationRequestSlug,
  DonationRequestSteps,
} from '@/lib/types/donationRequest';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { getApiClient } from '@lactalink/api';
import { DonationSchema, MilkBag, RequestSchema } from '@lactalink/types';
import { extractErrorMessage, extractID } from '@lactalink/utilities';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

type Block = Record<DonationRequestSteps, FC>;

type SearchParams = DonationRequestParams;

type FormData = DonationSchema | RequestSchema;

export default function CreateDonationRequest() {
  const { step, slug, ...searchParams } = useLocalSearchParams<SearchParams>();

  const pages = createDynamicRoute(`/${slug}/create`, DONATION_REQUEST_STEPS);
  const { nextPage, hasNextPage } = usePagination(pages, searchParams);

  const router = useRouter();

  const form = useFormContext<FormData>();

  const isSubmitting = form.formState.isSubmitting;

  const detailsForm: Record<DonationRequestSlug, FC> = {
    donations: DonationDetailsForm,
    requests: RequestDetailsForm,
  };

  const reviewForm: Record<DonationRequestSlug, FC> = {
    donations: DonationReview,
    requests: RequestReview,
  };

  const block: Block = {
    details: detailsForm[slug],
    deliveryPreferences: DeliveryDetailsForm,
    review: reviewForm[slug],
  };

  const RenderBlock = block[step];

  async function onSubmit(data: FormData) {
    const createPromise = 'donor' in data ? createDonation(data) : createRequest(data);

    toast.promise(createPromise, {
      loading: `Submitting ${slug.slice(0, -1)}...`,
      success: (res: { message: string }) => {
        console.log(res.message, res);
        return res.message;
      },
      error: (error) => extractErrorMessage(error),
    });

    await createPromise;

    router.replace('/map');
  }

  async function handleNext() {
    if (!hasNextPage || step === 'review') {
      form.handleSubmit(onSubmit)();
      return;
    }

    const fields: DonationRequestFields = {
      deliveryPreferences: ['deliveryPreferences'],
      details: DONATION_REQUEST_DETAILS[slug],
    };

    const allValid = await form.trigger(fields[step]);

    if (allValid) {
      nextPage();
    } else {
      toast.error('There are some invalid fields. Please fix them before proceeding.');
    }
  }

  return (
    <SafeArea safeTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="lg">
          <RenderBlock />

          <Button isDisabled={isSubmitting} size="lg" className="m-5" onPress={handleNext}>
            <ButtonText>{hasNextPage ? 'Next' : 'Submit'}</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}

async function createDonation(data: DonationSchema) {
  const apiClient = getApiClient();
  const { details, donor, deliveryPreferences: deliveryDetails } = data;

  const { bags, milkSample, ...restOfDetails } = details;

  const milkBagDocs = (
    await Promise.all(
      bags.map(async ({ quantity, ...data }) => {
        const docs: MilkBag[] = [];
        for (let i = 0; i < quantity; i++) {
          const milkBagDoc = await apiClient.create({
            depth: 0,
            collection: 'milkBags',
            data: { ...data, status: 'AVAILABLE' },
          });
          docs.push(milkBagDoc);
        }
        return docs;
      })
    )
  ).flat();

  const milkSampleDocs =
    milkSample && (await Promise.all(milkSample.map((sample) => uploadImage('images', sample))));

  const deliveryDetailDocs = await upsertDeliveryPreferences(deliveryDetails);

  const donationDoc = await apiClient.create({
    collection: 'donations',
    data: {
      donor,
      status: 'AVAILABLE',
      details: {
        ...restOfDetails,
        bags: extractID(milkBagDocs),
        milkSample: milkSampleDocs && extractID(milkSampleDocs),
      },
      deliveryDetails: extractID(deliveryDetailDocs),
    },
  });

  // Todo: Handle case where recipientId is provided
  // If provided, get the existing requestDoc of the recipient and update it with the new donation

  return {
    message: 'Donation created successfully!',
  };
}

async function createRequest(data: RequestSchema) {
  const apiClient = getApiClient();

  const {
    deliveryPreferences: deliveryDetails,
    details,
    requester,
    volumeNeeded,
    requestedDonor: _,
  } = data;

  const { image, ...restOfDetails } = details;

  const imageDoc = image && (await uploadImage('images', image));

  const deliveryDetailDocs = await upsertDeliveryPreferences(deliveryDetails);

  const requestDoc = await apiClient.create({
    collection: 'requests',
    data: {
      requester,
      status: 'PENDING',
      details: {
        ...restOfDetails,
        image: imageDoc && extractID(imageDoc),
      },
      deliveryDetails: extractID(deliveryDetailDocs),
      volumeNeeded,
    },
  });

  // Todo: Handle case where requestedDonor is provided
  // If provided, get the existing donationDoc of the requestedDonor and update it with the new request

  return {
    message: 'Request created successfully!',
  };
}
