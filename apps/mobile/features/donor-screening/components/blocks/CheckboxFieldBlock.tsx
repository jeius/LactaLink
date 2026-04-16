import { Form } from '@/components/contexts/FormProvider';
import { VStack } from '@/components/ui/vstack';
import { CheckboxBlockSchema, checkboxBlockSchema } from '@lactalink/form-schemas/blocks';
import {
  DefaultValueField,
  HelperTextField,
  HiddenField,
  LabelField,
  RequiredField,
  WidthField,
} from './_fields';
import { BaseBlockProps } from './_types';
import { useBlockForm } from './useBlockForm';

export default function CheckboxFieldBlock({
  control,
  name,
  defaultValues,
}: BaseBlockProps<CheckboxBlockSchema>) {
  const { methods } = useBlockForm({
    name,
    control,
    schema: checkboxBlockSchema,
    defaultValues: { ...defaultValues, blockType: 'checkbox' },
  });

  return (
    <Form {...methods}>
      <VStack space="lg">
        <LabelField control={methods.control} />

        <HelperTextField control={methods.control} />

        <DefaultValueField control={methods.control} valueType="boolean" />

        <RequiredField control={methods.control} />

        <HiddenField control={methods.control} />

        <WidthField control={methods.control} />
      </VStack>
    </Form>
  );
}
