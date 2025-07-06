import { FormField } from '@/components/FormField';
import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { DAYS, DELIVERY_OPTIONS } from '@/lib/constants';
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  SaveIcon,
  Trash2Icon,
  TruckIcon,
  XIcon,
} from 'lucide-react-native';

import {
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useDeliveryPreferenceForm } from '@/hooks/forms';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { DeliveryPreferenceSchema } from '@lactalink/types';
import { formatDaysToText } from '@lactalink/utilities/formatters';
import {
  FieldPath,
  FieldValues,
  FormProvider,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import { DeliveryPreferencesBottomSheet } from '../bottom-sheets/DeliveryPreferencesBottomSheet';
import { Image } from '../Image';
import { Box } from '../ui/box';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';

interface DeliveryPreferencesFormProps {
  name?: FieldPath<FieldValues>;
}

export function DeliveryPreferencesForm({
  name = 'deliveryPreferences',
}: DeliveryPreferencesFormProps) {
  const { fields, remove } = useFieldArray({ name });

  const form = useFormContext();

  const preferences: DeliveryPreferenceSchema[] = form.watch(name) || [];
  const preferenceIDs = preferences.map(({ id }) => id).filter((val) => val !== undefined);
  const disableRemove = fields.length <= 1;

  function handleChange(ids: string[]) {
    const newPreferences = ids
      .map((id) => preferences.find((pref) => pref.id === id))
      .filter(Boolean);

    form.setValue(name, newPreferences);
  }

  return (
    <VStack space="md" className="max-w-md py-5">
      <Text className="font-JakartaMedium">Delivery Preferences</Text>

      {fields.map((field, i) => {
        const { address, preferredMode, availableDays, name } = preferences[i]!;
        const addressName = address.displayName;
        const preferenceName = name || `Delivery Preference`;
        const availableDaysText = formatDaysToText(availableDays);

        return (
          <Card key={field.id} className="relative w-full">
            <VStack space="sm">
              <Text className="font-JakartaSemiBold">{preferenceName}</Text>

              <VStack space="md">
                <HStack space="sm" className="flex-wrap items-center">
                  {preferredMode.map((mode, index) => {
                    const iconAsset = getDeliveryPreferenceIcon(mode);
                    return (
                      <HStack
                        key={index}
                        space="xs"
                        className="border-primary-500 items-center rounded-md border px-2 py-1"
                      >
                        <Image
                          source={iconAsset}
                          alt={`${mode}-icon`}
                          style={{ width: 16, height: 16 }}
                        />
                        <Text size="sm" className="text-primary-500 font-JakartaMedium">
                          {DELIVERY_OPTIONS[mode].label}
                        </Text>
                      </HStack>
                    );
                  })}
                </HStack>

                <HStack space="xs" className="items-start">
                  <Icon as={CalendarDaysIcon} className="text-primary-500" />
                  <Text size="sm" className="font-JakartaMedium flex-1">
                    {availableDaysText}
                  </Text>
                </HStack>

                <HStack space="xs" className="items-start">
                  <Icon as={MapPinIcon} className="text-primary-500" />
                  <Text size="sm" className="font-JakartaMedium flex-1">
                    {addressName}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
            <Box className="absolute right-0 top-0">
              <Button
                action="negative"
                variant="link"
                className="h-fit w-fit p-4"
                isDisabled={disableRemove}
                onPress={() => remove(i)}
              >
                <ButtonIcon as={XIcon} />
              </Button>
            </Box>
          </Card>
        );
      })}

      <DeliveryPreferencesBottomSheet selectedIDs={preferenceIDs} onChange={handleChange} />
    </VStack>
  );
}

interface PreferenceProps {
  id: string;
  onRemove?: (id: string) => void;
  disableRemove?: boolean;
}

function Preference({ id, onRemove, disableRemove = false }: PreferenceProps) {
  const { user } = useAuth();

  const { form, isLoading, isFetching, submit } = useDeliveryPreferenceForm(id);

  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;
  const isSubmitSuccessful = form.formState.isSubmitSuccessful;

  const name = form.getValues('name') || `Delivery Preference`;

  function handleRemove() {
    onRemove?.(id);
  }

  function handleReset() {
    form.reset();
  }

  return (
    <FormProvider {...form}>
      <AccordionItem value={id}>
        <AccordionHeader>
          <AccordionTrigger isDisabled={isLoading} className="focus:web:rounded-lg">
            {({ isExpanded }: { isExpanded: boolean }) => {
              return (
                <>
                  {isExpanded ? (
                    <AccordionIcon as={ChevronUpIcon} className="mr-3" />
                  ) : (
                    <AccordionIcon as={ChevronDownIcon} className="mr-3" />
                  )}

                  <AccordionTitleText className="font-JakartaSemiBold">{name}</AccordionTitleText>

                  {isDirty ? (
                    <HStack>
                      <Button variant="outline" isDisabled={isSubmitting} onPress={submit}>
                        <ButtonIcon as={SaveIcon} />
                        <ButtonText>Save</ButtonText>
                      </Button>

                      <Button
                        isDisabled={isSubmitting}
                        variant="link"
                        action="negative"
                        onPress={handleReset}
                      >
                        <ButtonIcon as={XIcon} />
                      </Button>
                    </HStack>
                  ) : (
                    <Button
                      isDisabled={disableRemove || isSubmitting}
                      variant="link"
                      action="negative"
                      className="h-fit w-fit py-2"
                      onPress={handleRemove}
                    >
                      <ButtonIcon as={Trash2Icon} />
                    </Button>
                  )}
                </>
              );
            }}
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <VStack space="lg">
            <Card className="max-w-sm">
              <FormField
                name="preferredMode"
                fieldType="button-group"
                options={Object.values(DELIVERY_OPTIONS)}
                labelIcon={TruckIcon}
                label="Preferred Delivery Modes"
                containerClassName="gap-2"
                helperText="You can select multiple mode of delivery."
                allowMultipleSelection
              />
            </Card>
            <Card className="max-w-sm">
              <FormField
                name="availableDays"
                fieldType="button-group"
                label="Available Days"
                helperText="You can select multiple days for delivery."
                labelIcon={CalendarDaysIcon}
                options={Object.values(DAYS)}
                containerClassName="gap-2"
                allowMultipleSelection
              />
            </Card>
            <Card className="max-w-sm">
              <FormField
                name="address"
                fieldType="combobox"
                label="Preferred Address"
                helperText="Select your preferred address for delivery."
                placeholder="Select Address"
                searchPlaceholder="Search Address"
                labelIcon={MapPinIcon}
                containerClassName="gap-2"
                collection="addresses"
                where={{ owner: { equals: user?.id } }}
                searchPath="name"
                labelPath="name"
                icon={MapPinIcon}
                iconPosition="left"
              />
            </Card>
          </VStack>
        </AccordionContent>
      </AccordionItem>
    </FormProvider>
  );
}
