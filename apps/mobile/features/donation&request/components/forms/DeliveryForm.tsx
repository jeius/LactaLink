import { DateInputField } from '@/components/form-fields/DateInputField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { useDefaultAddress } from '@/features/address/hooks/useDefaultAddress';
import { getMeUser } from '@/lib/stores/meUserStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryCreateSchema, DeliverySchema, deliverySchema } from '@lactalink/form-schemas';
import { DeliveryPreference, Donation, Request } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import isEqual from 'lodash/isEqual';
import { CalendarDaysIcon, ClockIcon } from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { transformToAddressSchema } from '../../lib/transformData';
import SelectAddressField from './fields/SelectAddressField';
import SelectDeliveryPreferenceField from './fields/SelectDeliveryPreferenceField';

export interface DeliveryFormProps extends VStackProps {
  /**
   * Values to pre-populate the form with.
   * - If not provided, form will use default values.
   * - If provided, form will reset to these values whenever they change.
   */
  values?: DeliverySchema;
  /**
   * Callback fired when form is submitted with valid data.
   * - If a delivery preference is selected and matches one on the listing, `type` will be `CONFIRMED`.
   * - If a delivery preference is selected but doesn't match any on the listing, `type` will be `PROPOSED`.
   * - If no delivery preference is selected, `type` will be `PROPOSED`.
   */
  onChange?: (data: DeliveryCreateSchema) => void | Promise<void>;
  /**
   * List of delivery preferences to select from.
   */
  deliveryPreferences?: DeliveryPreference[] | null;
  /**
   * The context in which this form is being used, which may affect form behavior.
   *
   */
  listingType?: 'donation' | 'request';
  /**
   * If this form is being used in the context of a matched listing, pass the listing here so it
   * can determine if the selected delivery preference is a confirmed match or a new proposed preference.
   */
  matchedListing?: Donation | Request;
  /**
   * If the recipient of the donation/request is an organisation, pass their info here
   * to pre-populate address fields and adjust form behavior accordingly.
   */
  recipient?: {
    value: string;
    relationTo: Extract<CollectionSlug, 'individuals' | 'hospitals' | 'milkBanks'>;
  };
  isLoading?: boolean;
  isDisabled?: boolean;
  isSubmitting?: boolean;
}

export default function DeliveryForm({
  onChange,
  values,
  isLoading: isLoadingProp,
  isDisabled,
  isSubmitting,
  deliveryPreferences: prefs,
  matchedListing,
  recipient,
  listingType,
  ...props
}: DeliveryFormProps) {
  const { address: recipientAddress, ...recipientAddrQuery } = useDefaultAddress(recipient);

  const { control, reset, getValues, handleSubmit, setValue } = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: values || { note: '', deliveryPreference: null },
  });

  const prevStateRef = useRef(values);

  const isLoading = isLoadingProp || recipientAddrQuery.isLoading;
  const isOrgRecipient = recipient ? recipient.relationTo !== 'individuals' : false;
  const selectedDP = useWatch({ control, name: 'deliveryPreference' });
  const deliveryModes = selectedDP?.preferredMode.map((mode) => DELIVERY_OPTIONS[mode]);

  const deliveryPrefs = useMemo(() => {
    const meUser = getMeUser();
    const userDPs = extractCollection(meUser?.deliveryPreferences?.docs) || [];
    const allDPs = new Map<string, DeliveryPreference>();
    [...(prefs ?? []), ...userDPs].forEach((dp) => allDPs.set(dp.id, dp));
    return Array.from(allDPs.values()).sort((a, b) =>
      new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1
    );
  }, [prefs]);

  async function onSubmit(data: DeliverySchema) {
    const pref = data.deliveryPreference;

    if (!pref) {
      await onChange?.({ ...data, type: isOrgRecipient ? 'CONFIRMED' : 'PROPOSED' });
      return;
    }

    const matchedListingDP = matchedListing?.deliveryPreferences;
    const existingDP = matchedListingDP?.find((dp) => extractID(dp) === pref.id);
    if (existingDP) {
      await onChange?.({ ...data, type: 'CONFIRMED' });
    } else {
      await onChange?.({ ...data, type: 'PROPOSED' });
    }
  }

  // Sync form values with external values when they change,
  // but only if they are different to avoid resetting form state unnecessarily
  useEffect(() => {
    const currentValues = getValues();
    if (!isEqual(currentValues, values)) {
      reset(values);
      prevStateRef.current = values;
    }
  }, [getValues, reset, values]);

  useEffect(() => {
    if (selectedDP) {
      const options = { shouldDirty: true, shouldTouch: true, shouldValidate: true };
      setValue('address', selectedDP.address, options);
      if (selectedDP.preferredMode.length === 1) {
        setValue('mode', selectedDP.preferredMode[0]!, options);
      }
      return;
    } else {
      // If user deselects a delivery preference, revert the changes that were made when the DP was selected
      setValue('address', prevStateRef.current?.address!);
      setValue('mode', prevStateRef.current?.mode!);
    }

    if (recipient && recipientAddress) {
      if (recipient.relationTo !== 'individuals') {
        setValue('deliveryPreference', null);
        setValue('address', transformToAddressSchema(recipientAddress));
        // Donations to organisations default to delivery,
        // requests default to pickup since orgs don't have capacity to deliver
        if (listingType !== undefined) {
          setValue('mode', listingType === 'donation' ? 'DELIVERY' : 'PICKUP');
        }
        return;
      }
    }
  }, [getValues, setValue, selectedDP, recipient, recipientAddress, listingType]);

  return (
    <VStack {...props} space="lg">
      {!isOrgRecipient && (
        <>
          <SelectDeliveryPreferenceField
            control={control}
            name="deliveryPreference"
            selections={deliveryPrefs}
            isDisabled={isDisabled || isSubmitting}
            isLoading={isLoading}
          />

          <Divider />
        </>
      )}

      <SelectInputField
        control={control}
        name="mode"
        label="Method"
        helperText="Method of transaction (e.g. Delivery, Meet-up)"
        items={deliveryModes || Object.values(DELIVERY_OPTIONS)}
        transformItem={(item) => item}
        triggerInputProps={{ placeholder: 'Select a method...' }}
        isDisabled={isDisabled || isSubmitting || isOrgRecipient}
        isLoading={isLoading}
        isRequired
      />

      <DateInputField
        control={control}
        name="date"
        label="Preferred Date"
        helperText="Select your preferred date"
        datePickerProps={{
          mode: 'date',
          options: { display: 'calendar', minimumDate: new Date() },
          icon: CalendarDaysIcon,
          placeholder: 'Select a date...',
        }}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
        isRequired
      />

      <DateInputField
        control={control}
        name="time"
        label="Preferred Time"
        helperText="Select your preferred time"
        datePickerProps={{
          mode: 'time',
          options: { display: 'spinner' },
          icon: ClockIcon,
          placeholder: 'Select time...',
        }}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
        isRequired
      />

      {!selectedDP && !isOrgRecipient && (
        <SelectAddressField
          control={control}
          name="address"
          isDisabled={isDisabled || isSubmitting}
          isLoading={isLoading}
          isRequired
        />
      )}

      <TextAreaField
        control={control}
        name="note"
        label="Instructions"
        helperText="Additional delivery instructions (optional)"
        textareaProps={{
          keyboardType: 'default',
          placeholder: 'Enter any additional instructions here',
        }}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
      />

      <Box className="flex-1" />

      <Button
        size="lg"
        className="mt-2"
        onPress={handleSubmit(onSubmit)}
        isDisabled={isDisabled || isSubmitting}
      >
        <ButtonText>Confirm</ButtonText>
      </Button>
    </VStack>
  );
}
