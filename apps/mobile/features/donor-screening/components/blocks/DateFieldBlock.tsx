import { Form } from '@/components/contexts/FormProvider';
import { VStack } from '@/components/ui/vstack';
import { dateBlockSchema, DateBlockSchema } from '@lactalink/form-schemas/blocks';
import {
  DefaultValueField,
  HelperTextField,
  HiddenField,
  LabelField,
  PlaceholderField,
  RequiredField,
  WidthField,
} from './_fields';
import { BaseBlockProps } from './_types';
import { useBlockForm } from './useBlockForm';

export default function DateFieldBlock({
  control,
  name,
  defaultValues,
}: BaseBlockProps<DateBlockSchema>) {
  const { methods } = useBlockForm({
    name,
    control,
    schema: dateBlockSchema,
    defaultValues: { ...defaultValues, blockType: 'date' },
  });

  return (
    <Form {...methods}>
      <VStack space="lg">
        <LabelField control={methods.control} />

        <PlaceholderField control={methods.control} />

        <HelperTextField control={methods.control} />

        <DefaultValueField control={methods.control} valueType="date" />

        <RequiredField control={methods.control} />

        <HiddenField control={methods.control} />

        <WidthField control={methods.control} />
      </VStack>
    </Form>
  );
}
