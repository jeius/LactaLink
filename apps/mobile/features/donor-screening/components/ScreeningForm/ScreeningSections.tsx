import ArrayField, {
  ArrayFieldRenderProps,
  useArrayFieldContext,
} from '@/components/form-fields/ArrayField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { FlashList, ListRenderItemInfo } from '@/components/ui/FlashList';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { DonorScreeningFormSection } from '@lactalink/types/collections';
import isEqual from 'lodash/isEqual';
import { ChevronDownIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react-native';
import { memo, useMemo } from 'react';
import { Control, FieldArrayPath, useWatch } from 'react-hook-form';
import ScreeningFields from './ScreeningFields';

const MemoizedScreeningFields = memo(ScreeningFields, (prev, next) => isEqual(prev, next));

interface ScreeningSectionsProps {
  control: Control<DonorScreeningFormSchema>;
}

export default function ScreeningSections({ control }: ScreeningSectionsProps) {
  return (
    <ArrayField
      name="sections"
      control={control}
      contentPosition="last"
      label="Sections"
      helperText="Organize fields into sections to create a better flow for donors when completing the screening form."
      render={RenderFields}
    />
  );
}

function RenderFields({ fields, ...props }: ArrayFieldRenderProps) {
  const defaultValues = useMemo<DonorScreeningFormSection>(() => ({ title: '', fields: [] }), []);
  return (
    <VStack {...props} space="md" className="mt-2">
      <Accordion>
        <FlashList
          data={fields}
          keyExtractor={(item) => item._id}
          contentContainerClassName="grow"
          className="flex-1"
          ItemSeparatorComponent={() => <Box className="h-2" />}
          renderItem={(props) => <RenderFieldItem {...props} />}
        />
      </Accordion>

      <ArrayField.Append asChild defaultValues={defaultValues}>
        <Button variant="outline" size="sm">
          <ButtonIcon as={PlusCircleIcon} />
          <ButtonText>Add Section</ButtonText>
        </Button>
      </ArrayField.Append>
    </VStack>
  );
}

function RenderFieldItem({ index, item }: ListRenderItemInfo<Record<'_id', string>>) {
  const { control, name } = useArrayFieldContext((s) => ({ control: s.control, name: s.name }));
  const fieldName = `${name}.${index}` as FieldArrayPath<DonorScreeningFormSchema>;

  const label = useWatch({ control, name: `${fieldName}.title` }) as string | undefined;

  const title = label || `Field ${index + 1}`;

  return (
    <AccordionItem
      value={item._id}
      className="overflow-hidden rounded-xl border border-outline-200 bg-background-0"
    >
      <AccordionHeader className="p-0">
        <AccordionTrigger className="gap-2">
          <AccordionTitleText>{title}</AccordionTitleText>

          <ArrayField.Remove asChild index={index}>
            <Button variant="ghost" size="sm" action="negative" className="h-fit w-fit p-2">
              <ButtonIcon as={Trash2Icon} />
            </Button>
          </ArrayField.Remove>

          <AccordionIcon as={ChevronDownIcon} />
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent className="gap-4 px-4">
        <TextInputField
          control={control}
          name={`${fieldName}.title`}
          label="Section Title"
          isRequired
          helperText="The title of the section, which will be displayed to donors when completing the screening form."
        />

        <TextAreaField
          control={control}
          name={`${fieldName}.description`}
          label="Section Description"
          helperText="The description of the section. Optional but recommended to provide donors with more context about the fields within the section."
        />

        <MemoizedScreeningFields
          control={control as unknown as Control<DonorScreeningFormSchema>}
          name={`${fieldName}.fields` as FieldArrayPath<DonorScreeningFormSchema>}
          isRequired
        />
      </AccordionContent>
    </AccordionItem>
  );
}
