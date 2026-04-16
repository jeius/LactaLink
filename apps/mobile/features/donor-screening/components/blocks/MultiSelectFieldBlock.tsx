import { Form } from '@/components/contexts/FormProvider';
import { VStack } from '@/components/ui/vstack';
import { multiSelectBlockSchema, MultiSelectBlockSchema } from '@lactalink/form-schemas/blocks';
import { useWatch } from 'react-hook-form';
import {
  DefaultValueField,
  DynamicOptionField,
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

export default function MultiSelectFieldBlock({
  control,
  name,
  defaultValues,
}: BaseBlockProps<MultiSelectBlockSchema>) {
  const { methods } = useBlockForm({
    name,
    control,
    schema: multiSelectBlockSchema,
    defaultValues: { options: [], ...defaultValues, blockType: 'multi-select' },
  });

  const withDynamicOptions = useWatch({ control: methods.control, name: 'withDynamicOption' });

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

        <DynamicOptionField control={methods.control} isChecked={withDynamicOptions ?? false} />
      </VStack>
    </Form>
  );
}
