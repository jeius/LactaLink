import { Form } from '@/components/contexts/FormProvider';
import { VStack } from '@/components/ui/vstack';
import { radioBlockSchema, RadioBlockSchema } from '@lactalink/form-schemas/blocks';
import {
  DefaultValueField,
  HelperTextField,
  HiddenField,
  LabelField,
  OptionsField,
  PlaceholderField,
  RequiredField,
  WidthField,
} from './_fields';
import { BaseBlockProps } from './_types';
import { useBlockForm } from './useBlockForm';

export default function RadioFieldBlock({
  control,
  name,
  defaultValues,
}: BaseBlockProps<RadioBlockSchema>) {
  const { methods } = useBlockForm({
    name,
    control,
    schema: radioBlockSchema,
    defaultValues: { options: [], ...defaultValues, blockType: 'radio' },
  });

  return (
    <Form {...methods}>
      <VStack space="lg">
        <LabelField control={methods.control} />

        <PlaceholderField control={methods.control} />

        <HelperTextField control={methods.control} />

        <DefaultValueField control={methods.control} valueType="text" />

        <RequiredField control={methods.control} />

        <HiddenField control={methods.control} />

        <WidthField control={methods.control} />

        <OptionsField control={methods.control} />
      </VStack>
    </Form>
  );
}
