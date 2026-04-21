import { HeaderBackButton } from '@/components/HeaderBackButton';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Form, useForm } from '@/components/contexts/FormProvider';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { LeaveToastAction } from '@/components/toasts/ToastAction';
import { FlashList } from '@/components/ui/FlashList';
import FormSheetHandle from '@/components/ui/FormSheetHandle';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStackProps } from '@/components/ui/vstack';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { zodResolver } from '@hookform/resolvers/zod';
import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { useRouter } from 'expo-router';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { PlusCircleIcon, Trash2Icon } from 'lucide-react-native';
import { useCallback, useEffect, useRef } from 'react';
import {
  Control,
  DefaultValues,
  FieldArrayPath,
  useController,
  useFieldArray,
  UseFieldArrayReturn,
  useFormState,
  useForm as useHookForm,
} from 'react-hook-form';
import { GestureResponderEvent } from 'react-native';
import { toast } from 'sonner-native';
import { BLOCK_CONFIG, BLOCK_TYPE_LABELS } from '../../lib/constants';
import { BlockConfig, BlockSchema } from '../../lib/types';
import ArrayFormControl from './ArrayFormControl';
import {
  DefaultValueField,
  DynamicOptionField,
  HelperTextField,
  HiddenField,
  LabelField,
  PlaceholderField,
  RequiredField,
  WidthField,
} from './_fields';

interface Props extends VStackProps {
  name: FieldArrayPath<DonorScreeningFormSchema>;
}

export default function FieldSheet({ name }: Props) {
  const { control } = useForm<DonorScreeningFormSchema>();

  const {
    field: { value: block, onChange },
  } = useController({ control, name });

  if (!block) return null;

  return (
    <FieldSheetContent name={name} values={block as unknown as BlockSchema} onChange={onChange} />
  );
}

type FieldSheetContentProps = Props & {
  values: BlockSchema;
  onChange: (data: BlockSchema) => void;
};

function FieldSheetContent({ name, values: block, onChange }: FieldSheetContentProps) {
  const router = useRouter();

  const lastPushedValueRef = useRef({});

  const blockLabel = BLOCK_TYPE_LABELS[block.blockType] || 'Field';

  const config = BLOCK_CONFIG[block.blockType];

  const methods = useHookForm<BlockSchema>({
    resolver: zodResolver(config.schema),
    defaultValues: {
      ...block,
      name: block.name || name,
      label: block.label || config.defaultLabel,
      width: block.width || 'full',
      options: 'options' in block ? block.options : config.defaultOptions,
    } as DefaultValues<BlockSchema>,
  });

  const { reset, handleSubmit } = methods;

  const optionsArray = useFieldArray({
    control: methods.control,
    name: `options`,
    keyName: '_id',
  }) as UseFieldArrayReturn<BlockSchema, 'options', '_id'> | undefined;

  const { isDirty } = useFormState({ control: methods.control });

  usePreventBackPress(isDirty, showUnsavedWarning);

  const goBack = useCallback(
    (e: GestureResponderEvent) => {
      if (isDirty) {
        e.preventDefault();
        showUnsavedWarning();
      }
    },
    [isDirty]
  );

  const submit = useCallback(() => {
    handleSubmit((data: BlockSchema) => {
      lastPushedValueRef.current = data;
      reset(data);
      onChange(data);
      setTimeout(() => router.back(), 100);
    })();
  }, [handleSubmit, onChange, reset, router]);

  const handleAppend = useCallback(() => {
    if (!optionsArray) return;
    optionsArray.append({ label: undefined!, value: undefined! });
  }, [optionsArray]);

  const handleRemove = useCallback(
    (index: number) => {
      if (!optionsArray) return;
      optionsArray.remove(index);
    },
    [optionsArray]
  );

  // Sync: Parent -> This Form
  // Triggered when the parent form updates this field externally (e.g. a form-wide reset with
  // new server data). Skips the reset if the change originated from this form's own push above.
  useEffect(() => {
    const resetFromParent = debounce(() => {
      let newValues = block;
      if (!block.name) newValues = { ...block, name: name };
      if (isEqual(lastPushedValueRef.current, newValues)) return;
      // External value update: clear the snapshot and reset.
      lastPushedValueRef.current = {};
      reset(newValues);
    }, 800);

    resetFromParent();
    return () => resetFromParent.cancel();
  }, [block, reset, name]);

  return (
    <SafeArea safeTop={false} className="items-stretch justify-start">
      <FormSheetHandle />

      <HStack className="items-center gap-2 px-2 pb-1">
        <HeaderBackButton onPress={goBack} />
        <Text size="lg" bold className="flex-1">
          {blockLabel}
        </Text>
        {isDirty && (
          <Button variant="ghost" className="mr-2" onPress={() => reset()}>
            <ButtonText>Reset</ButtonText>
          </Button>
        )}
      </HStack>

      <Form {...methods}>
        <FlashList
          data={optionsArray?.fields || []}
          keyExtractor={(item) => item._id}
          renderScrollComponent={KeyboardAvoidingScrollView}
          className="flex-1"
          headerClassName="mb-4 gap-6"
          contentContainerClassName="grow p-4"
          footerClassName="mt-4 gap-6 flex-1 justify-between"
          ListHeaderComponent={<ListHeader control={methods.control} blockConfig={config} />}
          ListFooterComponent={
            <ListFooter
              onAdd={handleAppend}
              onConfirm={submit}
              control={methods.control}
              blockConfig={config}
            />
          }
          ItemSeparatorComponent={() => <Box className="h-4" />}
          renderItem={({ index }) => (
            <RenderOptionItem
              index={index}
              control={methods.control}
              name="options"
              onRemove={() => handleRemove(index)}
            />
          )}
        />
      </Form>
    </SafeArea>
  );
}

function ListHeader({
  control,
  blockConfig,
}: {
  control: Control<BlockSchema>;
  blockConfig: BlockConfig;
}) {
  return (
    <>
      <LabelField control={control} />

      {blockConfig.hasPlaceholder && <PlaceholderField control={control} />}

      <HelperTextField control={control} />

      <DefaultValueField control={control} valueType={blockConfig.valueType} />

      <RequiredField control={control} />

      <HiddenField control={control} />

      <WidthField control={control} />

      <ArrayFormControl
        control={control}
        name="options"
        label="Options"
        helperText="The list of options that users can choose from."
        isRequired
      />
    </>
  );
}

function ListFooter(props: {
  onConfirm?: () => void;
  onAdd?: () => void;
  control: Control<BlockSchema>;
  blockConfig: BlockConfig;
}) {
  const { onAdd, onConfirm, control, blockConfig } = props;

  return (
    <>
      <Button variant="outline" size="sm" onPress={onAdd}>
        <ButtonIcon as={PlusCircleIcon} />
        <ButtonText>Add Option</ButtonText>
      </Button>

      {blockConfig.hasDynamicOption && <DynamicOptionField control={control} />}

      <Button onPress={onConfirm}>
        <ButtonText>Save</ButtonText>
      </Button>
    </>
  );
}

type RenderOptionItemProps = {
  onRemove?: () => void;
  index: number;
  control: Control<BlockSchema>;
  name: FieldArrayPath<BlockSchema>;
};

export function RenderOptionItem({ onRemove, control, name, index }: RenderOptionItemProps) {
  const fieldName = `${name}.${index}` as const;

  const {
    field: { onChange: onChangeValue },
  } = useController({ control, name: `${fieldName}.value` });

  // Use field name as option.value
  useEffect(() => {
    onChangeValue(fieldName);
  }, [fieldName, onChangeValue]);

  return (
    <HStack space="md" className="items-center gap-2">
      <TextInputField
        control={control}
        name={`${fieldName}.label`}
        className="flex-1"
        inputProps={{
          placeholder: 'Enter the option',
          autoCapitalize: 'words',
          'aria-label': 'Enter the option',
        }}
      />

      <Button
        variant="ghost"
        size="sm"
        action="negative"
        className="h-fit w-fit p-3"
        onPress={onRemove}
      >
        <ButtonIcon as={Trash2Icon} />
      </Button>
    </HStack>
  );
}

function showUnsavedWarning() {
  toast.warning('You have unsaved changes. Are you sure you want to go back?', {
    action: <LeaveToastAction />,
  });
}
