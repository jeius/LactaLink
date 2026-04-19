import { Form } from '@/components/contexts/FormProvider';
import { VStack } from '@/components/ui/vstack';
import { forwardRef, useImperativeHandle } from 'react';
import { DefaultValues, useWatch } from 'react-hook-form';
import { BLOCK_CONFIG } from '../../lib/constants';
import { BaseBlockProps, BlockMethods, BlockSchema } from '../../lib/types';
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
import { useBlockForm } from './useBlockForm';

type Props = BaseBlockProps<BlockSchema> & {
  className?: string;
};

/**
 * A unified block field editor component that renders the appropriate form fields
 * based on the `blockType` in `defaultValues`. Supports all block types and exposes
 * an imperative `submit()` and `reset()` handle via ref.
 *
 * @param props - {@link BaseBlockProps} with `defaultValues.blockType` required.
 * @param ref - Ref forwarded to a {@link BlockMethods} for imperative control.
 */
const ScreeningFieldBlock = forwardRef<BlockMethods, Props>(function ScreeningFieldBlock(
  { defaultValues, blockType, className, ...props },
  ref
) {
  const config = BLOCK_CONFIG[blockType];

  const { methods } = useBlockForm({
    ...props,
    blockType,
    schema: config.schema,
    defaultValues: config
      ? ({
          ...(config.defaultOptions !== undefined ? { options: config.defaultOptions } : {}),
          ...(config.defaultLabel !== undefined ? { label: config.defaultLabel } : {}),
          ...defaultValues,
        } as DefaultValues<BlockSchema>)
      : defaultValues,
  });

  const withDynamicOptions = useWatch({
    control: methods.control,
    name: 'withDynamicOption',
  });

  useImperativeHandle(ref, () => ({
    submit: methods.submit,
    reset: methods.reset,
  }));

  if (!config) return null;

  return (
    <VStack space="lg" className={className}>
      <Form {...methods}>
        <LabelField control={methods.control} />

        {config.hasPlaceholder && <PlaceholderField control={methods.control} />}

        <HelperTextField control={methods.control} />

        <DefaultValueField control={methods.control} valueType={config.valueType} />

        <RequiredField control={methods.control} />

        <HiddenField control={methods.control} />

        <WidthField control={methods.control} />

        {config.hasOptions && <OptionsField control={methods.control} />}

        {config.hasDynamicOption && (
          <DynamicOptionField control={methods.control} isChecked={withDynamicOptions ?? false} />
        )}
      </Form>
    </VStack>
  );
});

export default ScreeningFieldBlock;
