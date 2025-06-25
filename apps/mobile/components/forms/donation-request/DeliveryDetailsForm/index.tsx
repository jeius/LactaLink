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
  PlusIcon,
  Trash2Icon,
  TruckIcon,
} from 'lucide-react-native';

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useFieldArray } from 'react-hook-form';

export function DeliveryDetailsForm() {
  const { user } = useAuth();

  const { fields, append, remove } = useFieldArray({ name: 'deliveryDetails', keyName: 'fieldId' });

  const disableRemove = fields.length <= 1;

  function handleAddPreference() {
    append({
      preferredMode: [],
      availableDays: [],
      address: '',
    });
  }

  return (
    <VStack space="md" className="w-screen max-w-md items-center py-5">
      <Accordion variant="unfilled" defaultValue={['preference-0']}>
        {fields.map((field, i) => {
          return (
            <AccordionItem key={field.fieldId} value={`preference-${i}`} className="w-full">
              <AccordionHeader>
                <AccordionTrigger className="focus:web:rounded-lg">
                  {({ isExpanded }: { isExpanded: boolean }) => {
                    return (
                      <>
                        {isExpanded ? (
                          <AccordionIcon as={ChevronUpIcon} className="mr-3" />
                        ) : (
                          <AccordionIcon as={ChevronDownIcon} className="mr-3" />
                        )}

                        <AccordionTitleText>
                          {'name' in field && typeof field.name === 'string'
                            ? field.name
                            : `Delivery Preference ${i + 1}`}
                        </AccordionTitleText>

                        <Button
                          isDisabled={disableRemove}
                          variant="link"
                          action="negative"
                          className="h-fit w-fit py-2"
                          onPress={() => remove(i)}
                        >
                          <ButtonIcon as={Trash2Icon} />
                        </Button>
                      </>
                    );
                  }}
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="">
                <VStack space="lg">
                  <Card className="max-w-sm">
                    <FormField
                      name={`deliveryDetails.${i}.preferredMode`}
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
                      name={`deliveryDetails.${i}.availableDays`}
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
                      name={`deliveryDetails.${i}.address`}
                      fieldType="combobox"
                      label="Preferred Address"
                      helperText="Select your preferred address for delivery."
                      labelIcon={MapPinIcon}
                      containerClassName="gap-2"
                      collection="addresses"
                      where={{ owner: { equals: user?.id } }}
                      searchPath="displayName"
                      labelPath="name"
                      descriptionPath="displayName"
                    />
                  </Card>
                </VStack>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Button variant="link" action="positive" onPress={handleAddPreference}>
        <ButtonIcon as={PlusIcon} />
        <ButtonText>Add Delivery Preference</ButtonText>
      </Button>
    </VStack>
  );
}
