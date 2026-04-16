import { Form } from '@/components/contexts/FormProvider';
import { VStack } from '@/components/ui/vstack';
import { textareaBlockSchema, TextareaBlockSchema } from '@lactalink/form-schemas/blocks';
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

export default function TextareaFieldBlock({
  control,
  name,
  defaultValues,
}: BaseBlockProps<TextareaBlockSchema>) {
  const { methods } = useBlockForm({
    name,
    control,
    schema: textareaBlockSchema,
    defaultValues: { ...defaultValues, blockType: 'textarea' },
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
      </VStack>
    </Form>
  );
}
