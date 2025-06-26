import { DeliveryDetailsForm } from '@/components/forms/donation-request/DeliveryDetailsForm';
import { DonationDetailsForm } from '@/components/forms/donation-request/DonationDetailsForm';
import { RequestDetailsForm } from '@/components/forms/donation-request/RequestDetailsForm';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';

import { usePagination } from '@/hooks/forms/usePagination';
import { uploadImage } from '@/lib/api/file';

import { DONATION_REQUEST_DETAILS, DONATION_REQUEST_STEPS } from '@/lib/constants/donationRequest';
import {
  DonationRequestFields,
  DonationRequestSlug,
  DonationRequestSteps,
  DonationStepsParams,
  RequestStepsParams,
} from '@/lib/types/donationRequest';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { ApiClient, getApiClient } from '@lactalink/api';
import {
  CreateDonationSchema,
  CreateRequestSchema,
  DeliverySchema,
  MilkBag,
} from '@lactalink/types';
import { extractErrorMessage, extractID } from '@lactalink/utilities';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

type Block = Record<DonationRequestSteps, FC>;

type SearchParams = DonationStepsParams &
  RequestStepsParams & {
    slug: DonationRequestSlug;
  };

type FormData = CreateDonationSchema | CreateRequestSchema;

export default function CreateDonation() {
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

  const block: Block = {
    details: detailsForm[slug],
    deliveryDetails: DeliveryDetailsForm,
  };

  const RenderBlock = block[step];

  async function onSubmit(data: FormData) {
    const createPromise = 'donor' in data ? createDonation(data) : createRequest(data);

    toast.promise(createPromise, {
      loading: `Creating ${slug.slice(0, -1)}...`,
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
    if (!hasNextPage) {
      form.handleSubmit(onSubmit)();
      return;
    }

    const fields: DonationRequestFields = {
      deliveryDetails: ['deliveryDetails'],
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
            <ButtonText>{hasNextPage ? 'Next' : 'Create'}</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}

async function createDonation(data: CreateDonationSchema) {
  const apiClient = getApiClient();
  const { recipient: _, details, donor, deliveryDetails } = data;

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

  const deliveryDetailDocs = await upsertDeliveryPreferences(deliveryDetails, apiClient);

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
    data: { donationDoc, milkBagDocs, deliveryDetailDocs },
    message: 'Donation created successfully!',
  };
}

async function createRequest(data: CreateRequestSchema) {
  const apiClient = getApiClient();
  console.log('Creating request with data:', data);
  // Todo: Implement request creation logic
  return {
    data: {},
    message: 'Request created successfully!',
  };
}

async function upsertDeliveryPreferences(deliveryDetails: DeliverySchema[], apiClient: ApiClient) {
  return await Promise.all(
    deliveryDetails.map((detail) => {
      const { id, ...rest } = detail;
      if (id) {
        return apiClient.updateByID({
          id,
          collection: 'delivery-preferences',
          data: rest,
          depth: 0,
        });
      }

      return apiClient.create({ collection: 'delivery-preferences', data: rest, depth: 0 });
    })
  );
}
